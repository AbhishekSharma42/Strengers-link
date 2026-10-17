# Stranger Chat — Random Video & Text Chat

React + Vite frontend, Node.js/Express + Socket.IO signaling/matching server, WebRTC calls, and optional PostgreSQL report storage.

## Important
This is a functional starter project, not a finished, abuse-proof public service. Test with two separate devices/browsers before launch. Public stranger video chat needs active moderation, privacy/legal review, age protections, rate limits, and a TURN server for reliable connections across networks. Do not promise anonymity or end-to-end encryption without implementing and auditing it.

## Requirements
- Node.js 20+ (LTS recommended)
- npm
- PostgreSQL only if you want report records saved persistently (optional for local demo)

## Run on Windows
1. Extract the ZIP.
2. Open the extracted `stranger-chat-app` folder in VS Code or a terminal.
3. Run `npm install`
4. Copy `server/.env.example` to `server/.env`.
5. For a local demo, leave `DATABASE_URL` empty. For reports saved to PostgreSQL, create a database and set `DATABASE_URL`.
6. Run `npm run dev`
7. Open the Vite URL shown in the terminal (usually `http://localhost:5173`).
8. To test matching, open the page in two separate browsers/devices. On a phone, use your computer's LAN IP and ensure both devices are on the same Wi-Fi. Local HTTP camera access is restricted by browsers except localhost; production must use HTTPS.

## Features included
- Guest session, random queue matching, next/leave
- Text chat over Socket.IO
- WebRTC audio/video with offer/answer/ICE signaling
- Camera/mic toggles
- Light/Dark theme (Light by default; saved locally in the browser)
- Video layouts: left/right, top/bottom, stranger full screen, and self full screen
- Chat panel opens from the Chat button and stays hidden until requested
- Report action; records are saved to PostgreSQL when configured
- Basic per-socket rate limiting and duplicate-match prevention
- Health endpoint

## PostgreSQL setup (optional)
Create a database, e.g. `stranger_chat`, then set `DATABASE_URL` in `server/.env`. On server startup the app creates a `reports` table automatically. In production use a managed PostgreSQL service, backups, and a secret connection string. Never commit `.env`.

## Public deployment overview

A `render.yaml` Blueprint is included for a starter deployment. From a GitHub repository, choose **New + → Blueprint** in Render and select this repository. Review the two services before applying. After deployment, confirm the actual service URLs and update `CLIENT_ORIGIN` on the backend and `VITE_SERVER_URL` on the frontend if Render assigns different URLs, then redeploy/rebuild. If the frontend URL is not exactly `https://stranger-chat-web.onrender.com`, update the backend `CLIENT_ORIGIN` to the actual frontend origin.

Recommended first deployment:
- Frontend: Vercel or Render Static Site, root directory `client`, build `npm run build`, output `dist`.
- Backend: Render Web Service, root directory `server`, build `npm install`, start `npm start`. Add environment variables `CLIENT_ORIGIN` (your deployed frontend URL), `DATABASE_URL` (optional), and `PORT` if needed.
- Update `client/.env.production` or Vercel environment variable `VITE_SERVER_URL` to your deployed backend URL, then rebuild frontend.
- Use a managed PostgreSQL database for persistent reports. Do not rely on free database plans for production; terms, expiry, sleep and storage limits vary.
- Configure a reputable TURN service (or deploy coturn) and set `VITE_TURN_URL`, `VITE_TURN_USERNAME`, and `VITE_TURN_CREDENTIAL` in the frontend hosting environment before rebuilding for public launch. These client-side values are exposed to browsers, so use short-lived/restricted TURN credentials. Public STUN alone cannot connect every network.
- Configure HTTPS and a custom domain. Vercel/Render can provide TLS for configured domains.
- Socket.IO must use a persistent Node service that supports WebSockets. Do not deploy the signaling server as a static site or a short-lived serverless function.

## Environment
See `server/.env.example`. `VITE_SERVER_URL` is the public backend origin; leave unset locally to use Vite proxy.

## Before accepting public users
1. Add robust moderation/admin tools, report review, repeat-offender bans and appeal process.
2. Add age gating and appropriate protections for minors; consider adult-only launch and get legal advice.
3. Publish Terms, Privacy Policy, Community Guidelines, and a contact/takedown process.
4. Use rate limits, CAPTCHA/anti-bot measures, content safety procedures and abuse escalation.
5. Add TURN, monitoring, error logging, backups, budget alerts and load tests.
6. Test on Chrome/Firefox/Safari, Android/iOS, different networks, reconnects, permission denial, and simultaneous Next clicks.
7. Review privacy laws applicable to your target countries. Avoid recording calls or storing chat contents by default.

## Monetization ideas
- Ads on non-call screens or between sessions, subject to ad-network policy approval.
- Premium features such as interest filters, ad-free use, profile cosmetics or queue preferences.
- Paid subscriptions only after you have retention and clear refund/cancellation terms.
- Sponsorships/affiliate offers that fit the audience.
No earnings are guaranteed. Video chat services have high moderation and bandwidth costs; validate the service and unit economics before buying traffic.


Hindi hosting steps: see `DEPLOYMENT_GUIDE_HI.md`.
