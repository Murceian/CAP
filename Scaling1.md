# CAP — App Overview & Scaling Reference

## App Overview

CAP is a **creative portfolio-store** — a single owner sells digital/physical products, offers services with tiered pricing, showcases portfolio work, and communicates with clients. It's a full-stack app with React on the front and Node/Express + MySQL on the back.

---

## Component & Data Flow Map

```
main.jsx
└── BrowserRouter
    └── AuthProvider          ← Loads JWT from localStorage on boot
        └── CartProvider      ← In-memory cart state (not persisted)
            └── App.jsx
                ├── Nav.jsx   ← Reads useAuth() + useCart()
                └── <Routes>
                    ├── /               Home.jsx
                    ├── /login          Login.jsx
                    ├── /register       Register.jsx
                    ├── /shop           Shop.jsx
                    ├── /shop/:id       ProductDetail.jsx
                    ├── /services       Services.jsx
                    ├── /services/:id   ServiceDetail.jsx
                    ├── /portfolio      Portfolio.jsx
                    ├── /portfolio/:id  PortfolioDetail.jsx
                    ├── /cart           Cart.jsx
                    └── /messaging      PrivateRoute → Messaging.jsx
```

---

## Role of Each Piece

| File | Role |
|---|---|
| `AuthContext.jsx` | Stores `{ user, token }`. Decodes JWT on load, checks expiry. Provides `login()`, `register()`, `logout()`, `isAdmin` |
| `CartContext.jsx` | In-memory cart. `addItem()` merges qty if duplicate. `removeItem()`, `clearCart()`, `itemCount` |
| `Nav.jsx` | Reads both contexts — shows cart badge, "Sign in" vs "Sign out", Admin link for admins |
| `PrivateRoute.jsx` | Redirects to `/login` if no token. Saves intended route in location state |
| `AdminRoute.jsx` | Redirects to `/login` or `/` if not admin |
| `apiClient.js` | Axios instance pointed at `VITE_API_URL`. All API calls go through here |
| `Card.jsx` | Reusable card — renders as a `<Link>` when `to` prop is given, plain div otherwise |
| `ErrorBoundary.jsx` | Catches React render errors without crashing the whole app |
| `src/data/*.js` | Static fallback data (used before DB was live, now superseded by API) |

### Pages

| Page | What it does | API call |
|---|---|---|
| `Home.jsx` | Hero + about + CTA row | None |
| `Shop.jsx` | Product grid with tag filter | `GET /products` |
| `ProductDetail.jsx` | Single product + "Add to cart" | `GET /products/:id` |
| `Services.jsx` | Service cards | `GET /services` |
| `ServiceDetail.jsx` | Single service + tier picker | `GET /services/:id` |
| `Portfolio.jsx` | Portfolio grid | `GET /portfolio` |
| `PortfolioDetail.jsx` | Single portfolio item + media | `GET /portfolio/:id` |
| `Cart.jsx` | Cart list + total + disabled Checkout button | None (local state) |
| `Login.jsx` | Email/password form → stores JWT | `POST /auth/login` |
| `Register.jsx` | Email/password/confirm form | `POST /auth/register` |
| `Messaging.jsx` | Placeholder (PrivateRoute gated) | None yet |

---

## CRUD System — Simple Breakdown

```
WHO              DOES WHAT     TO WHAT           HOW
─────────────────────────────────────────────────────────────
Anyone           READ          products           GET /api/products
Anyone           READ          services           GET /api/services
Anyone           READ          portfolio          GET /api/portfolio
Anyone           READ one      product/service    GET /api/*/id
Logged-in user   CREATE        order              POST /api/orders
Logged-in user   READ own      orders             GET /api/orders
Logged-in user   CREATE        booking            POST /api/bookings
Logged-in user   READ own      bookings           GET /api/bookings
Logged-in user   CREATE/READ   messages           POST /api/messages
Admin (DB set)   FULL CRUD     everything         /api/admin/* (Phase 5)
```

The server enforces this with three middleware layers:
- `verifyToken` — checks JWT is valid and attaches `req.user`
- `requireAdmin` — checks `req.user.role === 'admin'`
- `requireRole(role)` — flexible role check for future roles

---

## What's Missing for a Fully Functional Frontend

### 🔴 Broken / Incomplete Right Now
2. **Cart is not persisted** — refresh wipes it (no localStorage sync)
3. **Messaging page is empty** — just a placeholder, PrivateRoute gated but nothing renders
4. **ServiceDetail has no booking action** — tier picker UI exists but no `POST /api/bookings` call
5. **Checkout button is disabled** — `Cart.jsx` has a static "Available in Phase 6" button

### 🟡 Pages That Exist But Are Incomplete
6. **Register doesn't send the user to a confirmation or dashboard** — drops you at `/`
7. **No account/profile page** — logged-in users can't see their orders or bookings
8. **No order confirmation page** — after checkout (Phase 6), there's nowhere to land
9. **ProductDetail shows no image** — `card-media` div is empty, no `image_url` rendering

### 🟢 Fully Missing Pages/Flows
10. **`/account`** — user dashboard: past orders, bookings, conversations
11. **`/messaging`** — actual conversation UI (start thread, send/read messages)
12. **Admin dashboard** (Phase 5) — full CRUD panel

---

## Recommended Next Steps

| Priority | Task | Impact |
|---|---|---|
| 1 | Fix login 500 error | Unblocks all auth features |
| 2 | Persist CartContext to localStorage | UX — survives page refresh |
| 3 | Wire Messaging page | Complete the conversation flow |
| 4 | Wire ServiceDetail booking | Users can actually book a service |
| 5 | Build `/account` page | Orders + bookings dashboard |
| 6 | Phase 5 Admin dashboard | Manage content without touching the DB |
| 7 | Phase 6 Stripe checkout | Real payments |
