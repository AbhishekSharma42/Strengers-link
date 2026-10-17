import React, { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { Video, VideoOff, Mic, MicOff, MessageCircle, ShieldAlert, Shuffle, PhoneOff, Send, Sparkles, Users, Wifi, Camera, Sun, Moon, Rows2, Columns2, Maximize2, PanelRightOpen, X } from 'lucide-react';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || window.location.origin;
const iceServers = [
  { urls: 'stun:stun.l.google.com:19302' },
  ...(import.meta.env.VITE_TURN_URL ? [{
    urls: import.meta.env.VITE_TURN_URL,
    username: import.meta.env.VITE_TURN_USERNAME || '',
    credential: import.meta.env.VITE_TURN_CREDENTIAL || ''
  }] : [])
];

export default function App() {
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState('Ready to meet someone new');
  const [connected, setConnected] = useState(false);
  const [searching, setSearching] = useState(false);
  const [mode, setMode] = useState('video');
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [notice, setNotice] = useState('Be kind. You can leave or report a user at any time.');
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('strangerlink-theme') || 'light'; } catch { return 'light'; } });
  const [videoLayout, setVideoLayout] = useState(() => { try { return localStorage.getItem('strangerlink-video-layout') || 'side'; } catch { return 'side'; } });
  const [chatOpen, setChatOpen] = useState(false);
  const [localMediaReady, setLocalMediaReady] = useState(false);
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const localStream = useRef(null);
  const peer = useRef(null);
  const partnerId = useRef(null);
  const chatEnd = useRef(null);
  const queued = useRef(false);

  const stopPeer = useCallback(() => {
    if (peer.current) {
      peer.current.ontrack = null;
      peer.current.onicecandidate = null;
      peer.current.close();
      peer.current = null;
    }
    if (remoteVideo.current) remoteVideo.current.srcObject = null;
    partnerId.current = null;
    setConnected(false);
    setMessages([]);
  }, []);

  const stopLocal = useCallback(() => {
    if (localStream.current) {
      localStream.current.getTracks().forEach(t => t.stop());
      localStream.current = null;
    }
    setLocalMediaReady(false);
    if (localVideo.current) localVideo.current.srcObject = null;
  }, []);

  const ensureLocalMedia = useCallback(async () => {
    if (mode === 'text') return null;
    if (localStream.current) return localStream.current;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStream.current = stream;
    setLocalMediaReady(true);
    if (localVideo.current) localVideo.current.srcObject = stream;
    return stream;
  }, [mode]);

  const createPeer = useCallback((partner, signalingSocket) => {
    if (peer.current) peer.current.close();
    const pc = new RTCPeerConnection({ iceServers });
    peer.current = pc;
    partnerId.current = partner;
    if (localStream.current) localStream.current.getTracks().forEach(track => pc.addTrack(track, localStream.current));
    pc.ontrack = event => {
      if (remoteVideo.current) {
        remoteVideo.current.srcObject = event.streams[0];
        remoteVideo.current.play?.().catch(() => {});
      }
    };
    pc.onicecandidate = event => {
      if (event.candidate && signalingSocket) signalingSocket.emit('webrtc:ice', { to: partner, candidate: event.candidate });
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setConnected(true); setSearching(false); setStatus('Connected to a stranger');
      } else if (['failed', 'closed', 'disconnected'].includes(pc.connectionState)) {
        setConnected(false);
        if (pc.connectionState === 'failed') setNotice('Connection failed. Try Next; a TURN server may be needed on this network.');
      }
    };
    return pc;
  }, [socket]);

  useEffect(() => {
    const s = io(SERVER_URL, { transports: ['websocket', 'polling'] });
    setSocket(s);
    s.on('connect', () => setNotice('Server connected. Press Start to find a stranger.'));
    s.on('connect_error', () => setNotice('Cannot reach the chat server. Check that the backend is running.'));
    s.on('queue:waiting', () => { setSearching(true); setConnected(false); setStatus('Looking for someone…'); });
    s.on('match:found', async ({ partnerId: partner, initiator, partnerMode }) => {
      partnerId.current = partner;
      setSearching(false);
      setStatus(partnerMode === 'text' || mode === 'text' ? 'Stranger connected — say hello!' : 'Stranger found — connecting video…');
      setConnected(true);
      setMessages([{ system: true, text: 'You are connected. Be respectful and stay safe.' }]);
      if (mode === 'text' || partnerMode === 'text') return;
      try {
        await ensureLocalMedia();
        const pc = createPeer(partner, s);
        if (initiator) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          s.emit('webrtc:offer', { to: partner, description: pc.localDescription });
        }
      } catch (e) {
        setNotice(e?.name === 'NotAllowedError' ? 'Camera/microphone permission was denied. Allow permission and press Start again.' : 'Could not start camera/microphone. Check your device settings.');
        s.emit('match:leave');
        stopPeer();
      }
    });
    s.on('webrtc:offer', async ({ from, description }) => {
      try {
        if (!localStream.current && mode === 'video') await ensureLocalMedia();
        const pc = peer.current || createPeer(from, s);
        await pc.setRemoteDescription(description);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        s.emit('webrtc:answer', { to: from, description: pc.localDescription });
      } catch { setNotice('Could not establish video. Press Next to retry.'); }
    });
    s.on('webrtc:answer', async ({ description }) => {
      try { if (peer.current) await peer.current.setRemoteDescription(description); } catch {}
    });
    s.on('webrtc:ice', async ({ candidate }) => {
      try { if (peer.current && candidate) await peer.current.addIceCandidate(candidate); } catch {}
    });
    s.on('chat:message', msg => setMessages(prev => [...prev, { ...msg, incoming: true }]));
    s.on('match:ended', ({ reason }) => {
      stopPeer();
      setSearching(false);
      setStatus(reason === 'next' ? 'Stranger left. Press Start to meet someone else.' : 'Chat ended');
      setNotice('You are disconnected. Start again when ready.');
    });
    s.on('server:error', ({ message }) => setNotice(message || 'Something went wrong.'));
    return () => { s.disconnect(); stopPeer(); stopLocal(); };
  }, []); // one socket lifecycle per page

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    try { localStorage.setItem('strangerlink-theme', theme); } catch {}
    document.body.dataset.theme = theme;
  }, [theme]);

  useEffect(() => { try { localStorage.setItem('strangerlink-video-layout', videoLayout); } catch {} }, [videoLayout]);

  const start = async () => {
    if (!socket?.connected) { setNotice('Chat server is offline. Start the backend and refresh.'); return; }
    stopPeer();
    if (mode === 'video') {
      try { await ensureLocalMedia(); }
      catch { setNotice('Allow camera and microphone access to use video chat.'); return; }
    }
    queued.current = true;
    setSearching(true);
    setStatus('Looking for someone…');
    setNotice('Searching for an available stranger.');
    socket.emit('match:join', { mode });
  };

  const next = async () => {
    socket?.emit('match:next');
    stopPeer();
    setSearching(true);
    setStatus('Finding your next stranger…');
    setNotice('Looking for another available person.');
    if (mode === 'video') {
      try { await ensureLocalMedia(); } catch {}
    }
  };

  const leave = () => {
    socket?.emit('match:leave');
    stopPeer();
    setSearching(false);
    queued.current = false;
    setStatus('Ready to meet someone new');
    setNotice('You left the chat.');
  };

  const sendMessage = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !connected || !partnerId.current) return;
    socket.emit('chat:message', { text });
    setMessages(prev => [...prev, { text, outgoing: true, at: new Date().toISOString() }]);
    setDraft('');
  };

  const toggleCamera = () => {
    const track = localStream.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setCameraOn(track.enabled); }
  };
  const toggleMic = () => {
    const track = localStream.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setMicOn(track.enabled); }
  };
  const report = () => {
    if (!connected) { setNotice('Connect to a stranger before reporting.'); return; }
    const reason = window.prompt('Briefly describe the issue (e.g. harassment, nudity, spam):');
    if (!reason?.trim()) return;
    socket.emit('user:report', { reason: reason.trim() });
    setNotice('Report submitted. You have been disconnected for safety.');
    leave();
  };

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#"><span className="brand-icon"><Video size={21}/></span><span>stranger<span className="brand-accent">link</span></span></a>
      <div className="top-status"><span className="live-dot"/>{socket?.connected ? 'Service online' : 'Connecting…'}</div>
      <div className="header-tag"><Sparkles size={15}/> Meet someone new</div>
      <div className="header-actions">
        <button className="header-action" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'} title={theme === 'light' ? 'Dark mode' : 'Light mode'}>{theme === 'light' ? <Moon size={17}/> : <Sun size={17}/>}<span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span></button>
        <button className="header-action chat-toggle" onClick={() => setChatOpen(v => !v)} aria-expanded={chatOpen}><MessageCircle size={17}/><span>Chat</span>{chatOpen ? <X size={15}/> : <PanelRightOpen size={15}/>}</button>
      </div>
    </header>

    <main className="layout">
      <section className="main-column">
        <div className="mode-switch">
          <button className={mode === 'video' ? 'mode active' : 'mode'} onClick={() => { if (!connected && !searching) setMode('video'); }}><Video size={17}/> Video chat</button>
          <button className={mode === 'text' ? 'mode active' : 'mode'} onClick={() => { if (!connected && !searching) setMode('text'); }}><MessageCircle size={17}/> Text only</button>
        </div>

        <div className="video-layout-controls" aria-label="Video layout">
          <span>Video layout</span>
          <button className={videoLayout === 'side' ? 'layout-option active' : 'layout-option'} onClick={() => setVideoLayout('side')} title="Left-right split"><Columns2 size={15}/> Left / right</button>
          <button className={videoLayout === 'stacked' ? 'layout-option active' : 'layout-option'} onClick={() => setVideoLayout('stacked')} title="Top-bottom split"><Rows2 size={15}/> Top / bottom</button>
          <button className={videoLayout === 'stranger' ? 'layout-option active' : 'layout-option'} onClick={() => setVideoLayout('stranger')} title="Stranger full screen"><Maximize2 size={15}/> Stranger full</button>
          <button className={videoLayout === 'self' ? 'layout-option active' : 'layout-option'} onClick={() => setVideoLayout('self')} title="Your video full screen"><Camera size={15}/> My full</button>
        </div>
        <div className={`video-grid layout-${videoLayout}`}>
          <div className="video-card remote-card">
            <div className="video-label"><span className="label-dot"/>{connected ? 'STRANGER' : 'YOUR NEXT CHAT'}</div>
            {mode === 'video' && <video ref={remoteVideo} autoPlay playsInline className="video-feed"/>}
            {!connected && <div className="video-placeholder"><div className="placeholder-icon"><Users size={34}/></div><strong>{searching ? 'Finding a stranger…' : 'Someone new is out there'}</strong><span>{searching ? 'Keeping your place in the queue' : 'Press Start to begin'}</span></div>}
            {connected && mode === 'text' && <div className="video-placeholder"><div className="placeholder-icon"><MessageCircle size={34}/></div><strong>You’re connected</strong><span>Say hello in the chat</span></div>}
            <div className="video-footer"><span><Wifi size={14}/>{connected ? 'Connected' : 'Waiting'}</span><span>{mode === 'video' ? 'Live video' : 'Text session'}</span></div>
          </div>
          <div className="video-card local-card">
            <div className="video-label"><span className="label-dot local-dot"/>{mode === 'video' ? 'YOU' : 'TEXT MODE'}</div>
            {mode === 'video' && <video ref={localVideo} autoPlay muted playsInline className="video-feed local-feed"/>}
            {mode === 'text' && <div className="video-placeholder"><div className="placeholder-icon"><MessageCircle size={34}/></div><strong>Text chat mode</strong><span>Your camera stays off</span></div>}
            {mode === 'video' && !localMediaReady && <div className="local-overlay"><Camera size={19}/><span>Your camera preview appears here</span></div>}
            <div className="video-footer"><span><span className="tiny-dot"/>{cameraOn && mode === 'video' ? 'Camera ready' : 'Camera off'}</span><span>Private preview</span></div>
          </div>
        </div>

        <div className="call-controls">
          <button className="control-button mobile-chat-button" onClick={() => setChatOpen(v => !v)} aria-expanded={chatOpen}><MessageCircle/><span>{chatOpen ? 'Close chat' : 'Chat'}</span></button>
          <button className="control-button" onClick={toggleMic} disabled={mode !== 'video' || !localStream.current} aria-label="Toggle microphone">{micOn ? <Mic/> : <MicOff/>}<span>{micOn ? 'Mute' : 'Unmute'}</span></button>
          <button className="control-button" onClick={toggleCamera} disabled={mode !== 'video' || !localStream.current} aria-label="Toggle camera">{cameraOn ? <Video/> : <VideoOff/>}<span>{cameraOn ? 'Camera' : 'Camera off'}</span></button>
          {!connected && !searching ? <button className="primary-button" onClick={start}><Shuffle size={18}/> Start {mode === 'video' ? 'Video' : 'Chat'}</button> : <button className="primary-button next-button" onClick={next}><Shuffle size={18}/> Next stranger</button>}
          <button className="end-button" onClick={leave} disabled={!connected && !searching}><PhoneOff size={17}/><span>End</span></button>
        </div>
        <div className="status-line"><span className={connected ? 'status-indicator good' : 'status-indicator'}/>{status}</div>
        <div className="notice"><ShieldAlert size={17}/><span>{notice}</span></div>
      </section>

      {chatOpen && <><button className="chat-backdrop" aria-label="Close chat panel" onClick={() => setChatOpen(false)}/><aside className="chat-panel">
        <div className="chat-header"><div className="chat-heading-icon"><MessageCircle size={19}/></div><div><h2>Live chat</h2><p>{connected ? 'You’re chatting with a stranger' : 'Messages appear when connected'}</p></div><span className={connected ? 'chat-online' : 'chat-offline'}/><button className="chat-close" onClick={() => setChatOpen(false)} aria-label="Close chat"><X size={18}/></button></div>
        <div className="chat-safety"><ShieldAlert size={16}/><span>Never share passwords, payment details or your home address.</span></div>
        <div className="messages">
          {messages.length === 0 && <div className="empty-chat"><div className="empty-chat-icon"><MessageCircle size={25}/></div><strong>Your conversation starts here</strong><p>Start a chat to send and receive messages in real time.</p></div>}
          {messages.map((m, i) => m.system ? <div key={i} className="system-message">{m.text}</div> : <div key={i} className={`message ${m.outgoing ? 'outgoing' : 'incoming'}`}><span>{m.text}</span></div>)}
          <div ref={chatEnd}/>
        </div>
        <form className="message-form" onSubmit={sendMessage}>
          <input value={draft} onChange={e => setDraft(e.target.value)} placeholder={connected ? 'Type a message…' : 'Connect to start chatting'} disabled={!connected} maxLength={1000}/>
          <button type="submit" disabled={!connected || !draft.trim()} aria-label="Send message"><Send size={17}/></button>
        </form>
        <button className="report-button" onClick={report} disabled={!connected}><ShieldAlert size={16}/> Report this user</button>
      </aside></>}
    </main>
    <footer className="footer"><span>© {new Date().getFullYear()} StrangerLink</span><div><a href="#safety">Safety first</a><a href="#privacy">Privacy</a><a href="#terms">Terms</a></div><span className="footer-note">Be kind. Stay safe.</span></footer>
  </div>;
}