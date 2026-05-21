# SmartBook Web — Frontend Deployment Guide

## Step 1 — Configure .env
```
VITE_API_URL=https://your-api-domain.com/api
```
Replace `YOUR_API_DOMAIN.com` with your actual API domain.

## Step 2 — Build
```bash
npm install
npm run build
```
Output goes to `dist/` folder.

## Step 3 — Deploy
Upload `dist/` contents to your web server / CDN.

## Step 4 — Nginx config (SPA routing)
```nginx
server {
    listen 443 ssl;
    server_name your-frontend-domain.com;
    root /path/to/smartbook-web/dist;

    index index.html;

    # SPA fallback — all routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Important Notes
- The app uses React Router — `try_files ... /index.html` is REQUIRED
- All API calls go to `VITE_API_URL` — set this correctly
- CORS on API must allow this frontend domain
