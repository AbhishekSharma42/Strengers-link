import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'node:http';
import { Server } from 'socket.io';
import pg from 'pg';

const { Pool } = pg;
const PORT = Number(process.env.PORT || 4000);
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim()).filter(Boolean);
const app = express();
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '20kb' }));
app.get('/health', (_req, res) => res.json({ ok: true, service: 'stranger-chat-server', time: new Date().toISOString() }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: allowedOrigins, methods: ['GET', 'POST'], credentials: true },
  transports: ['websocket', 'polling'],
  pingInterval: 25000,
  pingTimeout: 20000
});

const pool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
}) : null;

if (pool) {
  pool.query(`CREATE TABLE IF NOT EXISTS reports (
    id BIGSERIAL PRIMARY KEY,
    reporter_session VARCHAR(100) NOT NULL,
    reported_session VARCHAR(100),
    reason VARCHAR(500) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`).then(() => console.log('PostgreSQL report table ready')).catch(err => {
    console.error('PostgreSQL initialization failed:', err.message);
  });
}

// Queue is intentionally in memory for the first version. Restarting this process clears it.
const waiting = [];
const sessions = new Map(); // socketId -> { partnerId, mode, lastMessageAt, lastJoinAt }
const messageCounters = new Map();

function safeRemoveFromQueue(id) {
  for (let i = waiting.length - 1; i >= 0; i--) {
    if (waiting[i].id === id) waiting.splice(i, 1);
  }
}
function unlink(id, reason = 'left') {
  const current = sessions.get(id);
  safeRemoveFromQueue(id);
  if (!current) return;
  const partnerId = current.partnerId;
  current.partnerId = null;
  if (partnerId) {
    const partner = sessions.get(partnerId);
    if (partner && partner.partnerId === id) partner.partnerId = null;
    io.to(partnerId).emit('match:ended', { reason });
  }
}
function findMatch(id) {
  const current = sessions.get(id);
  if (!current) return;
  safeRemoveFromQueue(id);
  // FIFO queue; only pair users who are currently waiting and not the same socket.
  const index = waiting.findIndex(item => item.id !== id && sessions.has(item.id) && !sessions.get(item.id).partnerId && item.mode === current.mode);
  if (index < 0) {
    waiting.push({ id, mode: current.mode, joinedAt: Date.now() });
    io.to(id).emit('queue:waiting');
    return;
  }
  const other = waiting.splice(index, 1)[0];
  const otherSession = sessions.get(other.id);
  if (!otherSession || otherSession.partnerId) {
    return findMatch(id);
  }
  current.partnerId = other.id;
  otherSession.partnerId = id;
  // The older queued user is the WebRTC offerer, avoiding simultaneous offers.
  io.to(id).emit('match:found', { partnerId: other.id, initiator: false, partnerMode: otherSession.mode });
  io.to(other.id).emit('match:found', { partnerId: id, initiator: true, partnerMode: current.mode });
}
function allowMessage(id) {
  const now = Date.now();
  const arr = (messageCounters.get(id) || []).filter(t => now - t < 10000);
  if (arr.length >= 20) { messageCounters.set(id, arr); return false; }
  arr.push(now); messageCounters.set(id, arr); return true;
}

io.on('connection', socket => {
  sessions.set(socket.id, { partnerId: null, mode: 'video', lastMessageAt: 0, lastJoinAt: 0 });
  socket.emit('server:ready', { id: socket.id });

  socket.on('match:join', payload => {
    const session = sessions.get(socket.id);
    if (!session) return;
    const mode = payload?.mode === 'text' ? 'text' : 'video';
    if (session.partnerId) unlink(socket.id, 'next');
    safeRemoveFromQueue(socket.id);
    session.mode = mode;
    session.lastJoinAt = Date.now();
    findMatch(socket.id);
  });

  socket.on('match:next', () => {
    const session = sessions.get(socket.id);
    if (!session) return;
    unlink(socket.id, 'next');
    safeRemoveFromQueue(socket.id);
    findMatch(socket.id);
  });

  socket.on('match:leave', () => {
    unlink(socket.id, 'left');
    safeRemoveFromQueue(socket.id);
  });

  socket.on('chat:message', payload => {
    const session = sessions.get(socket.id);
    const text = typeof payload?.text === 'string' ? payload.text.trim().slice(0, 1000) : '';
    if (!session?.partnerId || !text) return;
    if (!allowMessage(socket.id)) {
      socket.emit('server:error', { message: 'You are sending messages too quickly. Wait a few seconds.' });
      return;
    }
    const message = { text, at: new Date().toISOString() };
    io.to(session.partnerId).emit('chat:message', message);
  });

  socket.on('webrtc:offer', payload => {
    const session = sessions.get(socket.id);
    if (!session?.partnerId || payload?.to !== session.partnerId || !payload?.description) return;
    io.to(session.partnerId).emit('webrtc:offer', { from: socket.id, description: payload.description });
  });
  socket.on('webrtc:answer', payload => {
    const session = sessions.get(socket.id);
    if (!session?.partnerId || payload?.to !== session.partnerId || !payload?.description) return;
    io.to(session.partnerId).emit('webrtc:answer', { from: socket.id, description: payload.description });
  });
  socket.on('webrtc:ice', payload => {
    const session = sessions.get(socket.id);
    if (!session?.partnerId || payload?.to !== session.partnerId || !payload?.candidate) return;
    io.to(session.partnerId).emit('webrtc:ice', { from: socket.id, candidate: payload.candidate });
  });

  socket.on('user:report', async payload => {
    const session = sessions.get(socket.id);
    const reason = typeof payload?.reason === 'string' ? payload.reason.trim().slice(0, 500) : '';
    if (!reason || !session) return;
    const reported = session.partnerId;
    if (pool) {
      try {
        await pool.query(
          'INSERT INTO reports (reporter_session, reported_session, reason) VALUES ($1, $2, $3)',
          [socket.id, reported, reason]
        );
      } catch (err) {
        console.error('Could not save report:', err.message);
        socket.emit('server:error', { message: 'Report could not be saved. Please try again.' });
        return;
      }
    } else {
      console.warn('Report received but DATABASE_URL is not configured; report is not persisted.');
    }
    socket.emit('report:received', { saved: Boolean(pool) });
    unlink(socket.id, 'left');
  });

  socket.on('disconnect', () => {
    unlink(socket.id, 'left');
    sessions.delete(socket.id);
    messageCounters.delete(socket.id);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Stranger Chat server listening on port ${PORT}`);
  console.log(`Allowed client origins: ${allowedOrigins.join(', ')}`);
});
