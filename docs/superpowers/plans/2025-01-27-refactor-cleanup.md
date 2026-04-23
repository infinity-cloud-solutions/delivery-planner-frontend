# Refactor Cleanup — PR 6 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete TypeScript migration of delivery-planner-frontend, remove debug console.log calls, and fix remaining validateJWT() usage in components.

**Architecture:** Rename remaining .js/.jsx files to .ts/.tsx, add minimal typing, fix validateJWT() calls by using useAuthGuard() hook or correcting bugs. No behavior changes — only type safety improvements.

**Tech Stack:** React 18, TypeScript, Chakra UI v2, react-router-dom v6, react-app-rewired

---

### Task 1: Remove console.log from order modals

**Files:**
- Modify: `src/views/admin/orders/components/UpdateOrderModal.tsx`
- Modify: `src/views/admin/orders/components/CreateOrderModal.tsx`

- [ ] Remove `console.log("Please select a product...")` from UpdateOrderModal.tsx (~line 266)
- [ ] Remove `console.log("Please select a product...")` from CreateOrderModal.tsx (~line 166)
- [ ] Run: `grep -n "console.log" src/views/admin/orders/components/*.tsx` — should return empty

---

### Task 2: Fix validateJWT bugs & convert to TypeScript

**Files:**
- Modify+Rename: `src/views/admin/dashboard/index.jsx` → `index.tsx`
- Modify+Rename: `src/views/auth/signIn/index.jsx` → `index.tsx`
- Modify+Rename: `src/views/admin/dashboard/components/OrdersDashboard.js` → `OrdersDashboard.tsx`
- Rename: `src/layouts/auth/Protected.js` → `Protected.tsx`

- [ ] Dashboard: replace `validateJWT()` + navigate pattern with `useAuthGuard()`
- [ ] SignIn: remove `console.log` calls; fix useEffect dependency (use `navigate` not `history`)
- [ ] OrdersDashboard: fix bug `if (validateJWT)` → just `navigate('/admin/orders')` (already protected route)
- [ ] Protected.js: rename to .tsx, add `React.ReactNode` type for children prop

---

### Task 3: Convert priority layout & route files

**Files:**
- `src/layouts/auth/Default.js` → `Default.tsx`
- `src/layouts/auth/index.js` → `index.tsx`
- `src/layouts/admin/index.js` → `index.tsx`
- `src/layouts/driver/index.js` → `index.tsx`
- `src/routes.js` → `routes.tsx`
- `src/authRoutes.js` → `authRoutes.tsx`
- `src/driverRoutes.js` → `driverRoutes.tsx`
- `src/contexts/SidebarContext.js` → `SidebarContext.tsx`
- `src/index.js` → `index.tsx`

- [ ] Rename all files (git mv or cp+delete)
- [ ] Add RouteConfig type for routes arrays
- [ ] SidebarContext: add proper context types
- [ ] index.tsx: fix HTMLElement | null type for createRoot

---

### Task 4: Convert component files

**Files:** All `src/components/**/*.js`, `src/theme/**/*.js`, `src/variables/**/*.js`, remaining view variable files

- [ ] Theme files: rename to .ts (no JSX)
- [ ] Component files with JSX: rename to .tsx
- [ ] Variable/config files: rename to .ts

---

### Task 5: Final verification

- [ ] `find src -name "*.js" -o -name "*.jsx" | grep -v node_modules` — near-empty
- [ ] `npx tsc --noEmit` — no real errors
- [ ] `npm test -- --watchAll=false` — all pass
- [ ] `grep -rn "console.log" src --include="*.ts" --include="*.tsx" | grep -v test` — empty

---

### Task 6: Commit

```bash
git add -A
git commit -m "refactor: final cleanup — remove dead code, complete TypeScript migration

- Remove console.log debug statements from orders modals
- Convert remaining .js/.jsx files to .ts/.tsx
- Fix remaining validateJWT() calls in components
- Replace validateJWT() + navigate with useAuthGuard() in dashboard
- Clean up typed props in auth, layouts, routes, components

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```
