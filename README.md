# Snippet Box

Self-hosted app for organizing your code snippets, with OIDC authentication.

This is a fork of [pawelmalak/snippet-box](https://github.com/pawelmalak/snippet-box) modernized for 2026:

- **Backend**: Node 22 · Express 5 · TypeScript 5 · Sequelize 6 · openid-client v6
- **Frontend**: Vite 6 · React 19 · React Router 7 · Bootstrap 5 · Dart Sass
- **Auth**: OIDC (any standards-compliant IdP — PocketID, Authelia, Keycloak, Authentik, Zitadel, Dex…)

## Configuration

Copy `.env.example` to `.env` and fill in the values:

```sh
cp .env.example .env
# generate a strong session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Required variables:

| Variable | Description |
| --- | --- |
| `SESSION_SECRET` | Random string used to sign session cookies. |
| `OIDC_ISSUER_URL` | IdP issuer (e.g. `https://auth.example.com`). |
| `OIDC_CLIENT_ID` | Client ID registered in your IdP. |
| `OIDC_CLIENT_SECRET` | Client secret (optional if your IdP allows public PKCE clients). |
| `OIDC_REDIRECT_URI` | Must exactly match the redirect URI registered in your IdP, e.g. `https://snippets.example.com/auth/callback`. |

Optional:

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `5000` | HTTP port. |
| `TRUST_PROXY` | `0` | Set to `1` behind an HTTPS reverse proxy (enables secure cookies). |
| `OIDC_SCOPES` | `openid profile email` | OIDC scopes to request. |
| `OIDC_ALLOWED_EMAILS` | _empty_ | Comma-separated allow-list. Empty = anyone the IdP authenticates. |
| `OIDC_POST_LOGOUT_REDIRECT_URI` | `/` | Where to send users after logout. |

### IdP setup

Register a new OIDC client in your provider with:

- **Redirect URI**: `https://snippets.example.com/auth/callback` (and `http://localhost:5000/auth/callback` for local dev)
- **Scopes**: `openid`, `profile`, `email`
- **PKCE**: enabled (S256)
- **Grant type**: Authorization Code

## Run with Docker

```sh
docker compose up -d --build
```

`./data` (SQLite database) and `./sessions` (file-based session store) are persisted as bind mounts.

## Run locally (development)

Requires Node 20+.

```sh
npm run init           # installs root + client deps
cp .env.example .env   # fill in OIDC values
npm run dev            # backend on :5000, Vite on :5173 with proxy
```

The Vite dev server proxies `/api/*` and `/auth/*` to the backend on `:5000`, so just visit `http://localhost:5173`.

## Build manually

```sh
npm run build
node build/server.js
```

`npm run build` produces `build/` (compiled backend) and `public/` (Vite client output served by Express).

## Behind a reverse proxy

If you front the app with nginx/Caddy/Traefik over HTTPS:

```env
TRUST_PROXY=1
OIDC_REDIRECT_URI=https://snippets.example.com/auth/callback
```

The session cookie is automatically marked `Secure` when both flags are set.

## What's in this fork vs upstream

- Added OIDC login (PKCE + state + nonce), session-cookie auth, allow-list, logout
- Upgraded everything: Express 4→5, React 17→19, CRA→Vite, react-router 5→7, react-markdown 7→9, node-sass→Dart Sass, umzug 2→3, axios 0→1
- Replaced unmaintained Dockerfile, dropped Dockerfile.arm (base image is multi-arch)
- New `.env` driven config (no more `src/config/.env`)

## License

MIT — see [LICENCE.md](./LICENCE.md).
