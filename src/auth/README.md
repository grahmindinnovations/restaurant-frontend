# Auth & protected routes

## Folder layout

```
auth/
  config/
    routeConfig.js       ← EDIT HERE: which roles open which URLs (ACCESS_AREAS)
    activeRoleStorage.js ← session “active role” after login
  context/
    AuthProvider.jsx     ← Firebase user + /api/me allowedRoles
  guards/
    ProtectedRoute.jsx   ← login + role check wrapper
    RequireAuth.jsx      ← login only (select-role page)
    ProtectedPortal.jsx  ← /portal/:role
  pages/
    LoginPage.jsx
    RoleSelectPage.jsx
    AccessDeniedPage.jsx
    AuthLoadingPage.jsx
  routes/
    PublicRoutes.jsx     ← getPublicRoutes() — spread inside <Routes>
    ProtectedRoutes.jsx  ← getProtectedRoutes() — spread inside <Routes>
  index.js               ← public exports
```

## Add a new protected page

1. Add the path and roles in `config/routeConfig.js` under `ACCESS_AREAS`.
2. Register the route in `routes/ProtectedRoutes.jsx` inside the right guard (`ReceptionGuard`, etc.).

## Change who can access reception

Edit `ACCESS_AREAS.reception.roles` in `routeConfig.js` (default: `reception`, `admin`).
