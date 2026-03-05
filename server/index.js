require("dotenv").config();
const express = require("express");
const cors = require("cors");

const productsRouter = require("./routes/products");
const servicesRouter = require("./routes/services");
const portfolioRouter = require("./routes/portfolio");
const authRouter = require("./routes/auth");
const ordersRouter = require("./routes/orders");
const bookingsRouter = require("./routes/bookings");
const messagesRouter = require("./routes/messages");

const app = express();

// ── Middleware ──────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile apps)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// ── Health check ────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", ts: new Date().toISOString() });
});

// ── Routes ──────────────────────────────────────────────
app.use("/api/products", productsRouter);
app.use("/api/services", servicesRouter);
app.use("/api/portfolio", portfolioRouter);
app.use("/api/auth", authRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/messages", messagesRouter);

// ── 404 ─────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

// ── Global error handler ────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Internal server error" });
});

// ── Start ───────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}/api`);
});
