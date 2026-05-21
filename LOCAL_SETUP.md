# Vizit Web — Local Setup

## Նախապայմաններ
- Node.js 20+
- npm

## Քայլ 1 — Install
```bash
npm install
```

## Քայլ 2 — .env
`.env` ֆայլն արդեն configured է։
API-ն պետք է աշխատի `http://127.0.0.1:8000`-ի վրա։

## Քայլ 3 — Run
```bash
npm run dev
# Frontend կաշխատի http://localhost:5173
```

---

# Production Build

1. Copy `.env.production` → `.env`
2. Փոխիր `YOUR_API_DOMAIN` → իրական domain
3. Run:
```bash
npm run build
```
4. Upload `dist/` folder to server
5. Nginx config — SPA routing:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```
