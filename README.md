# restaurant-frontend

## Production API

In production the frontend calls the backend using `VITE_API_BASE_URL`.

Create `.env` (or set environment variables in your hosting panel):

```
VITE_API_BASE_URL=https://your-backend-domain.com
```

If `VITE_API_BASE_URL` is not set, the frontend will call `/api/...` on the same domain where the frontend is hosted, which usually causes `Cannot GET /api/...` (404).
