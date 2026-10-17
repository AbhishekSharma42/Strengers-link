# StrangerLink ko hosting par kaise chalayen (Render)

> Is project ko direct kisi account par publish nahi kiya ja sakta jab tak aap apne hosting account/repository ka access khud na dein. Yeh ZIP deployment-ready starter hai; actual deploy aapke Render account se hoga.

## 1. GitHub par upload karein
1. GitHub.com par login karke naya **private ya public repository** banayein.
2. ZIP extract karein aur uske andar ke project files repository ke root par upload/commit karein. `package.json`, `render.yaml`, `client/`, aur `server/` root par dikhne chahiye.
3. `.env` files, passwords, ya TURN credentials GitHub par upload na karein.

## 2. Render Blueprint deploy
1. Render.com par login karein.
2. Dashboard → **New + → Blueprint** choose karein.
3. Apna GitHub repository connect/select karein aur `render.yaml` review karein.
4. Apply/Deploy karein. Isse frontend static site aur Node/Socket.IO backend service create honi chahiye.
5. Deploy complete hone par Render se dono ke actual URLs copy karein.

## 3. Dono URLs verify karein
- Backend URL ke end par `/health` kholein. JSON mein `"ok": true` aana chahiye.
- Backend service ke Environment settings mein `CLIENT_ORIGIN` ko frontend ka exact origin set karein, jaise `https://your-frontend.onrender.com` (path/trailing slash ke bina).
- Frontend service ke Environment settings mein `VITE_SERVER_URL` ko backend ka exact base URL set karein, jaise `https://your-backend.onrender.com`.
- Frontend ko redeploy/rebuild karein, aur backend ko bhi save ke baad redeploy karein.

## 4. Do logon se test karein
1. Frontend URL Chrome mein kholein aur camera/mic permissions allow karein.
2. Wahi URL kisi doosre device ya doosre browser mein kholein.
3. Dono mein same mode (Video chat ya Text only) select karke Start dabayein.
4. Theme/layout setting browser mein locally save hoti hai. Har browser/device apni preference alag rakhega.

## Zaroori baatein
- Browser video/audio ke liye HTTPS chahiye; Render HTTPS deta hai.
- Public STUN se har network par video call connect nahi hoti. Reliable public launch se pehle TURN service configure karein (`VITE_TURN_URL`, `VITE_TURN_USERNAME`, `VITE_TURN_CREDENTIAL`) aur frontend rebuild karein.
- Waiting queue aur live sessions backend ki memory mein hain. Backend restart hone par queue reset hogi.
- Reports ko permanently save karne ke liye PostgreSQL `DATABASE_URL` set karein.
- Is starter mein abhi secure, complete admin dashboard/moderation console nahi hai. Public launch se pehle age/safety controls, abuse review, rate limiting, privacy/terms, and monitoring complete karna zaroori hai.
