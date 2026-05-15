# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start            # Dev server (react-app-rewired)
npm run build        # Production build
npm test             # Unit tests (Jest + React Testing Library)
npm test -- --testPathPattern=<file>  # Run a single test file
npm run test:e2e     # Playwright E2E tests
npm run test:e2e:ui  # Playwright with interactive UI
```

Dependencies require `--legacy-peer-deps` (react-leaflet@3 targets React 17 but works with React 18). The `.npmrc` already sets this for installs.

## Architecture

### Dual-Portal App

Two user-facing portals sharing the same codebase, separated by route prefix and auth role:

- `/admin/*` — Admin layout: orders, clients, products, dashboard
- `/driver/*` — Driver layout: assigned deliveries view
- `/auth/*` — Unauthenticated: sign-in

Routing uses **HashRouter** (not BrowserRouter) to enable static hosting without server-side route config.

### Authentication

AWS Cognito Identity JS handles login. After sign-in, the Cognito ID token is stored in `localStorage`. `src/security.ts` decodes the JWT client-side (via jsonwebtoken) to check `cognito:groups` membership (`"Admin"` or `"Repartidor"`). Note: `getAccessToken()` in security.ts returns the **ID token**, not the Cognito access token — this is intentional and named misleadingly.

Webpack polyfills for `crypto`/`stream`/`vm` (in `config-overrides.js`) exist solely to support jsonwebtoken running in the browser.

### State Management

No global state library. Each domain has a custom hook that owns its data, loading, and error state and exposes API operations:

- `useOrders(initialDate)` — order CRUD, route scheduling, delivery sequencing
- `useClients()` — client CRUD + phone lookup
- `useProducts()` — lazy-loaded product list
- `useDeliveries()` — driver-side delivery status updates

`SidebarContext` is the only React context — it just toggles the sidebar.

### API Layer

Axios with `Authorization: Bearer <idToken>` header. Four separate base URL env vars:

```
REACT_APP_CLIENTS_BASE_URL
REACT_APP_ORDERS_BASE_URL
REACT_APP_PRODUCTS_BASE_URL
REACT_APP_UPDATE_SEQUENCING_ORDERS_BASE_URL
```

### Driver Assignment

Drivers are mapped from email to numeric ID via `REACT_APP_DRIVERS_MAP` (a JSON string env var). This allows driver assignment without code changes.

### Route Configuration

Navigation and routing are co-defined in config objects (`routes.tsx`, `driverRoutes.tsx`, `authRoutes.tsx`) using the `RouteConfig` interface. These are consumed by both the sidebar navigation and the `<Route>` tree.

### UI Components

Chakra UI v2 is the component system. `src/components/` contains Horizon UI template components (navbar, sidebar, cards). Some of these have `@ts-nocheck` and are not fully typed — treat them as third-party.

### Alert/Toast Pattern

There is no global toast provider. Components manage an `AlertMessage` state (`{type: 'success'|'error', text: string}`) locally and auto-dismiss after 3 seconds.

## Key Files

| File | Purpose |
|------|---------|
| `src/index.tsx` | App entry, router setup, portal routing |
| `src/security.ts` | JWT decode, role checks, token retrieval |
| `src/routes.tsx` / `src/driverRoutes.tsx` | Route + nav config objects |
| `src/layouts/auth/Protected.tsx` | Route guard component |
| `src/types/` | Shared TypeScript types (Order, Client, Product, Delivery) |
| `src/theme/theme.ts` | Chakra UI theme overrides |
| `config-overrides.js` | Webpack polyfills for browser JWT decoding |

## TypeScript

Strict mode is enabled. `baseUrl` is set to `src/`, so imports resolve from the project root without `../` chains.
