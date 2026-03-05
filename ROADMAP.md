# CAP — Full Build Roadmap

> **Purpose:** Single source of truth for the entire project plan. Every phase below must be completed in order. Each phase has a verification step — do not move on until it passes.

---

## Project Summary

**App:** Portfolio-store hybrid — sells physical products, digital services, showcases past work, and includes an on-site messaging system.

**Tech Stack:**

| Layer | Technology |
|---|---|
| Frontend (web) | React 19 + Vite 7, react-router-dom 6, axios, clsx |
| Backend | Node.js + Express |
| Database | PostgreSQL (pgAdmin for management) |
| Auth | Email + password, bcrypt, JWT |
| Payments | Stripe |
| Notifications | Nodemailer (email) |
| Media storage | Render persistent disk |
| Deployment | Render (all three layers) |
| Mobile | React Native / Expo (consumes same API) |

**Core Data Objects:** User, Product, Service, PortfolioItem, Order, OrderItem, Booking, Conversation, Message

---

## Decisions (Locked)

- **Auth:** Email + password only. `is_admin` set manually in pgAdmin.
- **User roles:** `role` enum column (`user` | `moderator` | `admin`) for privilege control. Admin UI allows role changes via `PATCH /api/admin/users/:id/role`.
- **Messaging:** 5-second polling (`setInterval` in `useEffect`). No WebSockets.
- **Media:** Render persistent disk (mounted volume on Express, served as static files).
- **Deployment:** Postgres, Express API, and React frontend all on Render free tier.
- **Environment variables:** Vite uses `import.meta.env.VITE_*` — never `process.env` on the client.
- **ESLint:** Flat config format (`eslint.config.js`), ESLint 9.x.

---

## Current State (Pre–Phase 1)

### Completed

- [x] Vite React project scaffolded and running
- [x] Base UI: Shop, Services, Portfolio, Messaging pages
- [x] CSS design system with custom properties (warm palette — will change to dark in Phase 1)
- [x] Page-based routing with react-router-dom (`/shop`, `/services`, `/portfolio`, `/messaging`)
- [x] Folder structure: `pages/`, `components/`, `components/layout/`, `src/utils/`
- [x] ErrorBoundary (class component), Logger, apiClient utilities
- [x] All syntax errors resolved, dependencies installed
- [x] Barrel exports for pages, components, layout, utils

### File Tree

```
CAP/
├── .env.example              ← VITE_API_URL template
├── .env.local                ← VITE_API_URL=http://localhost:3001/api
├── .gitignore
├── ERROR_HANDLING.md
├── eslint.config.js          ← flat config, ESLint 9.x
├── index.html
├── package.json
├── vite.config.js
│
├── components/
│   ├── index.js              ← exports Card, ErrorBoundary
│   ├── Card.jsx              ← reusable card (title, subtitle, priceLabel, meta[], tags[], accent)
│   ├── ErrorBoundary.jsx     ← class component, import.meta.env.MODE for dev check
│   └── layout/
│       ├── index.js          ← exports Nav
│       └── Nav.jsx           ← NavLink-based header
│
├── pages/
│   ├── index.js              ← exports Shop, Services, Portfolio, Messaging
│   ├── Shop.jsx              ← 4 inline products, tag filter (useState), Card grid
│   ├── Services.jsx          ← 3 inline services, Card grid
│   ├── Portfolio.jsx         ← 3 inline portfolio items, Card grid
│   └── Messaging.jsx         ← static shell, no form logic
│
├── public/
├── services/                 ← empty, reserved for future API service modules
│
└── src/
    ├── App.jsx               ← ErrorBoundary > Nav > Routes > footer
    ├── App.css               ← all layout/component styles
    ├── main.jsx              ← StrictMode + BrowserRouter
    ├── index.css             ← CSS variables (design tokens), body styles
    ├── assets/
    ├── components/
    │   └── ErrorBoundary.css
    └── utils/
        ├── index.js          ← exports logger, apiClient
        ├── apiClient.js      ← axios instance, VITE_API_URL, error interceptor
        └── logger.js         ← Logger class (error/warn/info/debug)
```

### Inline Data Shapes

**Product:** `{ id, title, subtitle, priceLabel, meta[], tags[], accent }`
**Service:** `{ id, title, subtitle, priceLabel, meta[], tags[], accent }`
**PortfolioItem:** `{ id, title, subtitle, meta[], tags[], accent }` (no priceLabel)

### CSS Variables (`:root` in `src/index.css`)

| Variable | Current Value | Phase 1 Target |
|---|---|---|
| `--paper` | `#f7f3ee` | dark navy/slate |
| `--ink` | `#141b23` | near-white |
| `--accent` | `#ff8f72` (peach) | cyan/electric blue |
| `--accent-2` | `#3a6d9c` (slate blue) | TBD cool accent |
| `--muted` | `#556071` | lighter muted |
| `--line` | `rgba(20,27,35,0.15)` | light-on-dark |
| `--shadow-1` | `0 18px 40px rgba(20,27,35,0.12)` | update for dark BG |
| `--shadow-2` | `0 10px 18px rgba(20,27,35,0.08)` | update for dark BG |
| `--display-font` | Palatino serif stack | keep |

### Dependencies (package.json)

**Runtime:** react 19.2, react-dom 19.2, react-router-dom 6.30, axios 1.7, clsx 2.1
**Dev:** vite 7.3, @vitejs/plugin-react 5.1, eslint 9.39, eslint-plugin-react-hooks 5.0

---

## Phase 1 — Frontend Foundation

**Goal:** Extract data, dark palette, Home page.

### Tasks

1. Create `src/data/products.js`, `src/data/services.js`, `src/data/portfolio.js` — move inline arrays out of page files.
2. Update imports in `pages/Shop.jsx`, `pages/Services.jsx`, `pages/Portfolio.jsx`.
3. Update `src/index.css` CSS variables for dark/cool palette.
4. Update `src/App.css` as needed for dark background compatibility (card backgrounds, text colors, gradients).
5. Create `pages/Home.jsx` — hero section, about blurb + photo placeholder, social links, CTA row.
6. Add `<Route path="/" element={<Home />} />` in `src/App.jsx`. Remove the `<Navigate>` redirect.
7. Update `pages/index.js` barrel to export `Home`.
8. Update `Nav.jsx` to include a "Home" NavLink.

### Verification

- `npm run dev` — all 5 pages render cleanly on dark background
- No inline data remains in page components
- Home page hero and CTA visible at `/`

---

## Phase 2 — Interactable Cards + Cart

**Goal:** Cards link to detail pages. Cart context tracks items.

### Tasks

1. Make `Card.jsx` accept an `onClick` or `to` prop to wrap content in a `Link`.
2. Create detail pages:
   - `pages/ProductDetail.jsx` — `useParams()` to find product by ID from data file, "Add to Cart" button
   - `pages/ServiceDetail.jsx` — 3 package tiers (Basic / Standard / Premium), "Book" button
   - `pages/PortfolioDetail.jsx` — full project view, media placeholder
3. Add routes in `src/App.jsx`:
   - `/shop/:id` → `<ProductDetail />`
   - `/services/:id` → `<ServiceDetail />`
   - `/portfolio/:id` → `<PortfolioDetail />`
4. Create `src/context/CartContext.jsx` — `{ items, addItem, removeItem, clearCart, itemCount }`.
5. Wrap app in `CartProvider` in `src/main.jsx`.
6. Add cart icon with badge (item count) to `Nav.jsx`.
7. Create `pages/Cart.jsx` — list cart items, total, "Checkout" CTA (placeholder).
8. Add `/cart` route.

### Verification

- Click a product card → detail page renders at `/shop/p1`
- "Add to Cart" increments badge in nav
- Cart page shows correct items and total
- Back navigation works from detail pages

---

## Phase 3 — Backend: Node/Express + PostgreSQL

**Goal:** Full REST API with PostgreSQL backing all data.

### Folder Structure

```
server/
  index.js              ← Express entry, CORS, JSON parser, /api router
  db.js                 ← pg Pool from DATABASE_URL
  seed.sql              ← CREATE TABLE + INSERT seed data
  routes/
    products.js         ← GET /api/products, GET /api/products/:id
    services.js         ← GET /api/services, GET /api/services/:id
    portfolio.js        ← GET /api/portfolio, GET /api/portfolio/:id
    auth.js             ← POST /api/auth/register, POST /api/auth/login
    orders.js           ← POST /api/orders, GET /api/orders/:id
    bookings.js         ← POST /api/bookings, GET /api/bookings (user's own)
    messages.js         ← GET /api/messages/:conversationId, POST /api/messages
    admin.js            ← admin-only CRUD + analytics
  middleware/
    auth.js             ← verifyToken (JWT decode, attach req.user)
    requireAdmin.js     ← checks req.user.role === 'admin'
    requireRole.js      ← checks req.user.role against allowed roles array
```

### Database Schema

```sql
-- Users
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user','moderator','admin')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  subtitle    TEXT,
  price       NUMERIC(10,2) NOT NULL,
  price_label VARCHAR(50),
  meta        TEXT[],
  tags        TEXT[],
  accent      VARCHAR(20),
  image_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Services
CREATE TABLE services (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  subtitle    TEXT,
  price_label VARCHAR(50),
  tiers       JSONB,          -- { basic: {price, features[]}, standard: {...}, premium: {...} }
  meta        TEXT[],
  tags        TEXT[],
  accent      VARCHAR(20),
  image_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio Items
CREATE TABLE portfolio_items (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  subtitle    TEXT,
  meta        TEXT[],
  tags        TEXT[],
  accent      VARCHAR(20),
  media_urls  TEXT[],          -- array of file paths on persistent disk
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id),
  total       NUMERIC(10,2) NOT NULL,
  status      VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','paid','shipped','fulfilled','cancelled')),
  stripe_id   VARCHAR(255),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id          SERIAL PRIMARY KEY,
  order_id    INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id  INTEGER REFERENCES products(id),
  qty         INTEGER NOT NULL DEFAULT 1,
  price       NUMERIC(10,2) NOT NULL
);

-- Bookings
CREATE TABLE bookings (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id),
  service_id  INTEGER REFERENCES services(id),
  tier        VARCHAR(20),
  booked_at   TIMESTAMPTZ,
  notes       TEXT,
  status      VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations
CREATE TABLE conversations (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id),
  subject     VARCHAR(255),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id              SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       INTEGER REFERENCES users(id),
  body            TEXT NOT NULL,
  sent_at         TIMESTAMPTZ DEFAULT NOW()
);

-- Events (analytics / user data capture)
CREATE TABLE events (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id),
  event_type  VARCHAR(50) NOT NULL,   -- 'page_view', 'add_to_cart', 'purchase', 'booking', etc.
  payload     JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### API Endpoints Summary

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | — | List all products |
| GET | `/api/products/:id` | — | Single product |
| GET | `/api/services` | — | List all services |
| GET | `/api/services/:id` | — | Single service |
| GET | `/api/portfolio` | — | List all portfolio items |
| GET | `/api/portfolio/:id` | — | Single portfolio item |
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Get JWT |
| POST | `/api/orders` | user | Create order |
| GET | `/api/orders` | user | User's orders |
| GET | `/api/orders/:id` | user | Single order detail |
| POST | `/api/bookings` | user | Create booking |
| GET | `/api/bookings` | user | User's bookings |
| GET | `/api/messages/:convId` | user | Messages in conversation |
| POST | `/api/messages` | user | Send message |
| GET | `/api/conversations` | user | User's conversations |

### Tasks

1. `npm init -y` inside `server/`, install `express`, `cors`, `pg`, `dotenv`, `bcrypt`, `jsonwebtoken`.
2. Create `server/db.js` with `pg.Pool` reading `DATABASE_URL`.
3. Create `server/seed.sql` with all tables above + initial product/service/portfolio seed data.
4. Run `seed.sql` against local Postgres via pgAdmin.
5. Build all route files with parameterized queries (`$1`, `$2` — never string interpolation).
6. Build `middleware/auth.js` and `middleware/requireAdmin.js`.
7. Test every endpoint in Postman **before** touching frontend code.
8. Wire frontend: replace `src/data/` imports with `useEffect` + `apiClient.get(...)` calls. Add loading and error states to each page.
9. Add `server/.env` with `DATABASE_URL`, `JWT_SECRET`, `PORT=3001`.

### Verification

- Postman: `GET /api/products` returns JSON array from Postgres
- Postman: `POST /api/auth/register` → `POST /api/auth/login` → valid JWT
- Frontend: Shop page loads products from API, shows loading spinner then cards
- SQL queries tested in pgAdmin before being placed in route files

---

## Phase 4 — Auth: Accounts + Admin Role

**Goal:** Users can register/login. Admin role gates the admin dashboard.

### Tasks

1. Create `src/context/AuthContext.jsx` — `{ user, token, login, logout, isAdmin }`.
2. `login()` calls `POST /api/auth/login`, stores JWT in `localStorage`, decodes payload to get `user` object.
3. `logout()` clears `localStorage` and resets state.
4. Wrap app in `AuthProvider` in `src/main.jsx` (inside `CartProvider`).
5. Create `components/PrivateRoute.jsx` — redirects to `/login` if no token.
6. Create `components/AdminRoute.jsx` — redirects to `/` if `user.role !== 'admin'`.
7. Create `pages/Login.jsx` and `pages/Register.jsx` — forms posting to `/api/auth/*`.
8. Add routes: `/login`, `/register`.
9. Nav shows "Login" or "Account" based on auth state.
10. Manually set `role = 'admin'` for your account in pgAdmin.

### Verification

- Register → login → JWT stored in `localStorage`
- Decoded JWT contains `{ id, email, role }`
- Visiting `/admin` without admin role redirects to `/`
- Visiting `/admin` as admin shows dashboard

---

## Phase 5 — Admin Dashboard

**Goal:** Full CRUD admin panel for all resources + user management.

### Admin API Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/api/admin/products` | List all (same as public, but context) |
| POST | `/api/admin/products` | Create product |
| PUT | `/api/admin/products/:id` | Update product |
| DELETE | `/api/admin/products/:id` | Delete product |
| GET | `/api/admin/services` | List all |
| POST | `/api/admin/services` | Create service |
| PUT | `/api/admin/services/:id` | Update service |
| DELETE | `/api/admin/services/:id` | Delete service |
| GET | `/api/admin/portfolio` | List all |
| POST | `/api/admin/portfolio` | Create portfolio item |
| PUT | `/api/admin/portfolio/:id` | Update portfolio item |
| DELETE | `/api/admin/portfolio/:id` | Delete portfolio item |
| GET | `/api/admin/orders` | All orders |
| PATCH | `/api/admin/orders/:id/status` | Update order status |
| GET | `/api/admin/bookings` | All bookings |
| PATCH | `/api/admin/bookings/:id/status` | Approve/reject booking |
| GET | `/api/admin/messages` | All conversations |
| POST | `/api/admin/messages/:convId` | Reply to conversation |
| GET | `/api/admin/users` | All users |
| PATCH | `/api/admin/users/:id/role` | Change user role |
| DELETE | `/api/admin/users/:id` | Disable/delete user |
| GET | `/api/admin/analytics` | Aggregated event data |

### Admin Pages

| Route | Component | Description |
|---|---|---|
| `/admin` | `AdminDashboard.jsx` | Overview: order count, booking count, revenue, unread messages |
| `/admin/products` | `AdminProducts.jsx` | Table + create/edit modal |
| `/admin/services` | `AdminServices.jsx` | Table + create/edit modal |
| `/admin/portfolio` | `AdminPortfolio.jsx` | Table + create/edit modal + media upload |
| `/admin/orders` | `AdminOrders.jsx` | Table, status dropdown |
| `/admin/bookings` | `AdminBookings.jsx` | Table, approve/reject buttons |
| `/admin/messages` | `AdminMessages.jsx` | Conversation list, reply panel |
| `/admin/users` | `AdminUsers.jsx` | Table, role dropdown, disable button |
| `/admin/analytics` | `AdminAnalytics.jsx` | Event table, basic charts |

### Tasks

1. Create `pages/admin/` folder with all admin page components.
2. Add admin routes in `src/App.jsx` wrapped in `<AdminRoute>`.
3. Create `components/layout/AdminNav.jsx` — sidebar nav for admin section.
4. Build all `server/routes/admin.js` endpoints, guarded by `requireAdmin` middleware.
5. Wire admin pages to API with `apiClient`.
6. Add "Admin" link to main Nav (conditional on `isAdmin`).

### Verification

- Admin can create a product → it appears on the public Shop page
- Admin can change a user's role → that user's JWT reflects the new role on next login
- Admin can view all orders, bookings, and messages
- Non-admin users see no admin links and get 401/redirect on `/admin/*`

---

## Phase 6 — Commerce (Stripe)

**Goal:** Users can purchase products via Stripe checkout.

### Tasks

1. Install `stripe` on server, `@stripe/react-stripe-js` + `@stripe/stripe-js` on client.
2. Server: `POST /api/checkout/create-payment-intent` — receives cart items, calculates total, calls `stripe.paymentIntents.create(...)`, returns `clientSecret`.
3. Client: Create `pages/Checkout.jsx` — shows cart summary, renders Stripe `PaymentElement`, handles confirmation.
4. On successful payment: `POST /api/orders` creates the order and order_items rows. Cart is cleared.
5. `POST /api/events` with `event_type: 'purchase'` and order payload.
6. Order confirmation page at `/orders/:id`.
7. Admin orders view shows Stripe payment ID for reference.

### Environment Variables

- Server: `STRIPE_SECRET_KEY`
- Client: `VITE_STRIPE_PUBLIC_KEY`

### Verification

- Stripe test card `4242 4242 4242 4242` completes payment
- Order row created in `orders` + `order_items` tables
- Admin sees the order in `/admin/orders`
- Cart is cleared after successful checkout

---

## Phase 7 — Bookings + Notifications

**Goal:** Users can book services. Owner gets email notification.

### Tasks

1. Install `nodemailer` on server.
2. `ServiceDetail.jsx` adds a booking form: date picker, notes textarea, tier selection.
3. `POST /api/bookings` saves the row, fires Nodemailer email to owner's address with booking details.
4. Admin can view/approve/reject in `/admin/bookings`.
5. When admin responds, `PATCH /api/admin/bookings/:id/status` triggers email back to customer.
6. `POST /api/events` with `event_type: 'booking'`.

### Environment Variables

- Server: `EMAIL_USER`, `EMAIL_PASS`, `OWNER_EMAIL`

### Verification

- Book a service → row in `bookings` table with status `pending`
- Email arrives at owner inbox with booking details
- Admin approves → customer gets confirmation email
- Booking appears in user's account page

---

## Phase 8 — Messaging System

**Goal:** Two-stage messaging — contact form for guests, full DM for logged-in users.

### Stage 1 — Contact Form (no login required)

1. `Messaging.jsx` gets a form: name, email, subject, message body.
2. `POST /api/contact` sends email via Nodemailer to owner. No database row.
3. Success toast: "Message sent!"

### Stage 2 — On-Site DM (login required)

1. Logged-in users see a conversation thread UI instead of the contact form.
2. `POST /api/conversations` creates a new conversation.
3. `POST /api/messages` adds a message to the conversation.
4. `GET /api/messages/:conversationId` returns all messages, ordered by `sent_at`.
5. Frontend polls every 5 seconds: `setInterval` inside `useEffect` calls `GET /api/messages/:conversationId`.
6. Admin inbox (`/admin/messages`) shows all conversations with most recent message preview. Admin can reply inline.

### Verification

- Guest submits contact form → email received
- Logged-in user sends message → message appears in conversation thread
- Admin replies → user sees reply within 5 seconds
- Multiple conversations listed correctly

---

## Phase 9 — Deployment

**Goal:** All three layers live on Render.

### Render Services

| Service | Type | Build Command | Start Command |
|---|---|---|---|
| Postgres | Managed Database | — | — |
| Express API | Web Service (Node) | `cd server && npm install` | `node index.js` |
| React Frontend | Static Site | `npm install && npm run build` | — (serves `dist/`) |

### Environment Variables on Render

**API Service:**
- `DATABASE_URL` (from Render Postgres)
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `EMAIL_USER`, `EMAIL_PASS`, `OWNER_EMAIL`
- `PORT` (Render sets automatically)
- `CLIENT_URL` (for CORS allowlist)

**Static Site:**
- `VITE_API_URL` = `https://your-api.onrender.com/api`
- `VITE_STRIPE_PUBLIC_KEY`

### Tasks

1. Provision Render PostgreSQL database.
2. Connect to Render DB from pgAdmin, run `seed.sql`.
3. Deploy Express API as Web Service. Set all env vars. Confirm health check endpoint returns 200.
4. Deploy React frontend as Static Site. Set `VITE_API_URL`.
5. Configure CORS on server: allow only the frontend's Render domain.
6. Add `_redirects` file or Render rewrite rule for SPA routing: `/* → /index.html 200`.
7. Test full flow on live URL: register → login → browse → add to cart → checkout → booking → message.

### Verification

- All three Render services show "Live" status
- Full user flow works on production URL
- Admin login works, CRUD reflected in live DB
- No `localhost` references in production build

---

## Phase 10 — Mobile App (React Native / Expo)

**Goal:** Expo app consuming the same deployed API.

### Project Setup

```
CAP-mobile/          ← separate repo
  App.js
  app.json
  screens/
    HomeScreen.js
    ShopScreen.js
    ProductDetailScreen.js
    ServicesScreen.js
    ServiceDetailScreen.js
    PortfolioScreen.js
    PortfolioDetailScreen.js
    MessagingScreen.js
    LoginScreen.js
    RegisterScreen.js
    AccountScreen.js
    CartScreen.js
    CheckoutScreen.js
  context/
    AuthContext.js
    CartContext.js
  utils/
    apiClient.js      ← same axios config, points to Render API URL
  components/
    Card.js            ← Pressable card (equivalent of web Card.jsx)
    TagFilter.js       ← horizontal ScrollView of filter pills
```

### Screen Mapping

| Web Page | Mobile Screen | Key RN Components |
|---|---|---|
| Home | HomeScreen | ScrollView, Image, Pressable |
| Shop | ShopScreen | FlatList, tag filter ScrollView, Pressable cards |
| ProductDetail | ProductDetailScreen | ScrollView, Image, Button |
| Services | ServicesScreen | FlatList, Pressable cards |
| ServiceDetail | ServiceDetailScreen | ScrollView, tier cards, booking form |
| Portfolio | PortfolioScreen | FlatList, Pressable cards |
| PortfolioDetail | PortfolioDetailScreen | ScrollView, media viewer |
| Messaging | MessagingScreen | FlatList (messages), TextInput |
| Login | LoginScreen | TextInput, Button |
| Register | RegisterScreen | TextInput, Button |
| Cart | CartScreen | FlatList, total, checkout button |
| Account | AccountScreen | order history, booking history |

### Tasks

1. `npx create-expo-app CAP-mobile` in a new directory.
2. Install: `axios`, `@react-navigation/native`, `@react-navigation/stack`, `expo-secure-store`.
3. Create `AuthContext.js` — same pattern as web, but store JWT in `SecureStore` instead of `localStorage`.
4. Create `CartContext.js` — same state shape as web.
5. Build `ShopScreen` first (reference `week7-demo/App.js` from CIT382) — `FlatList` + tag filter + `Pressable` cards.
6. Build remaining screens one at a time, testing on Expo Go.
7. Point `apiClient.js` at the Render API URL.

### Verification

- Expo Go on phone: browse shop, filter tags, view product detail
- Login → JWT stored in SecureStore
- Add to cart → checkout flow works
- Messages poll and update every 5 seconds

---

## Phase Dependency Graph

```
Phase 1 (data extraction, dark palette, Home page)
  └─► Phase 2 (interactable cards, cart)
        └─► Phase 3 (Express + PostgreSQL backend)
              ├─► Phase 4 (auth: accounts, JWT, roles)
              │     └─► Phase 5 (admin dashboard)
              ├─► Phase 6 (Stripe commerce)
              ├─► Phase 7 (bookings + email notifications)
              └─► Phase 8 (messaging system)
                    └─► Phase 9 (deployment)
                          └─► Phase 10 (mobile app)
```

> Phases 6, 7, 8 can be built in parallel once Phase 4 is complete. Phase 5 (admin) can grow incrementally as each feature phase is finished.

---

## One-Layer-at-a-Time Rule

For every new feature:

1. **Database first** — write and test the SQL in pgAdmin.
2. **API second** — build the Express route, test in Postman.
3. **Frontend last** — wire the React component to the API.

Never skip the API layer. Never let the client touch the database directly.
