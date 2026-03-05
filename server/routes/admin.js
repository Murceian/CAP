const router = require("express").Router();
const pool = require("../db");
const { verifyAdmin } = require("../middleware/auth");

// Every admin route requires admin role
router.use(verifyAdmin);

// ── Stats ───────────────────────────────────────────────────

// GET /api/admin/stats
router.get("/stats", async (_req, res, next) => {
  try {
    const [[{ products }]] = await pool.query("SELECT COUNT(*) AS products FROM products");
    const [[{ services }]] = await pool.query("SELECT COUNT(*) AS services FROM services");
    const [[{ portfolio }]] = await pool.query("SELECT COUNT(*) AS portfolio FROM portfolio_items");
    const [[{ orders }]]   = await pool.query("SELECT COUNT(*) AS orders FROM orders");
    const [[{ bookings }]] = await pool.query("SELECT COUNT(*) AS bookings FROM bookings");
    const [[{ users }]]    = await pool.query("SELECT COUNT(*) AS users FROM users");
    const [[{ revenue }]]  = await pool.query(
      "SELECT COALESCE(SUM(total), 0) AS revenue FROM orders WHERE status != 'cancelled'"
    );

    const [recentOrders] = await pool.query(
      `SELECT o.id, o.total, o.status, o.created_at AS createdAt, u.email AS userEmail
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC
       LIMIT 8`
    );

    res.json({ products, services, portfolio, orders, bookings, users, revenue, recentOrders });
  } catch (err) {
    next(err);
  }
});

// ── Products ────────────────────────────────────────────────

router.get("/products", async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, subtitle, price, price_label AS priceLabel,
              meta, tags, accent, image_url AS imageUrl, created_at AS createdAt
       FROM products ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.post("/products", async (req, res, next) => {
  try {
    const { title, subtitle, price, priceLabel, meta, tags, accent, imageUrl } = req.body;
    if (!title || price == null)
      return res.status(400).json({ message: "title and price are required" });

    const [result] = await pool.query(
      `INSERT INTO products (title, subtitle, price, price_label, meta, tags, accent, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        subtitle || null,
        price,
        priceLabel || null,
        meta ? JSON.stringify(meta) : null,
        tags ? JSON.stringify(tags) : null,
        accent || "peach",
        imageUrl || null,
      ]
    );
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.put("/products/:id", async (req, res, next) => {
  try {
    const { title, subtitle, price, priceLabel, meta, tags, accent, imageUrl } = req.body;
    await pool.query(
      `UPDATE products
       SET title=?, subtitle=?, price=?, price_label=?, meta=?, tags=?, accent=?, image_url=?
       WHERE id=?`,
      [
        title,
        subtitle || null,
        price,
        priceLabel || null,
        meta ? JSON.stringify(meta) : null,
        tags ? JSON.stringify(tags) : null,
        accent || "peach",
        imageUrl || null,
        req.params.id,
      ]
    );
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: "Not found" });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete("/products/:id", async (req, res, next) => {
  try {
    await pool.query("DELETE FROM products WHERE id = ?", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) { next(err); }
});

// ── Services ────────────────────────────────────────────────

router.get("/services", async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, subtitle, price_label AS priceLabel,
              tiers, meta, tags, accent, image_url AS imageUrl, created_at AS createdAt
       FROM services ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.post("/services", async (req, res, next) => {
  try {
    const { title, subtitle, priceLabel, tiers, meta, tags, accent, imageUrl } = req.body;
    if (!title) return res.status(400).json({ message: "title is required" });

    const [result] = await pool.query(
      `INSERT INTO services (title, subtitle, price_label, tiers, meta, tags, accent, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        subtitle || null,
        priceLabel || null,
        tiers ? JSON.stringify(tiers) : null,
        meta ? JSON.stringify(meta) : null,
        tags ? JSON.stringify(tags) : null,
        accent || "peach",
        imageUrl || null,
      ]
    );
    const [rows] = await pool.query("SELECT * FROM services WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.put("/services/:id", async (req, res, next) => {
  try {
    const { title, subtitle, priceLabel, tiers, meta, tags, accent, imageUrl } = req.body;
    await pool.query(
      `UPDATE services
       SET title=?, subtitle=?, price_label=?, tiers=?, meta=?, tags=?, accent=?, image_url=?
       WHERE id=?`,
      [
        title,
        subtitle || null,
        priceLabel || null,
        tiers ? JSON.stringify(tiers) : null,
        meta ? JSON.stringify(meta) : null,
        tags ? JSON.stringify(tags) : null,
        accent || "peach",
        imageUrl || null,
        req.params.id,
      ]
    );
    const [rows] = await pool.query("SELECT * FROM services WHERE id = ?", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: "Not found" });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete("/services/:id", async (req, res, next) => {
  try {
    await pool.query("DELETE FROM services WHERE id = ?", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) { next(err); }
});

// ── Portfolio ───────────────────────────────────────────────

router.get("/portfolio", async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, subtitle, meta, tags, accent, media_urls AS mediaUrls, created_at AS createdAt
       FROM portfolio_items ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.post("/portfolio", async (req, res, next) => {
  try {
    const { title, subtitle, meta, tags, accent, mediaUrls } = req.body;
    if (!title) return res.status(400).json({ message: "title is required" });

    const [result] = await pool.query(
      `INSERT INTO portfolio_items (title, subtitle, meta, tags, accent, media_urls)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        title,
        subtitle || null,
        meta ? JSON.stringify(meta) : null,
        tags ? JSON.stringify(tags) : null,
        accent || "peach",
        mediaUrls ? JSON.stringify(mediaUrls) : null,
      ]
    );
    const [rows] = await pool.query("SELECT * FROM portfolio_items WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.put("/portfolio/:id", async (req, res, next) => {
  try {
    const { title, subtitle, meta, tags, accent, mediaUrls } = req.body;
    await pool.query(
      `UPDATE portfolio_items SET title=?, subtitle=?, meta=?, tags=?, accent=?, media_urls=? WHERE id=?`,
      [
        title,
        subtitle || null,
        meta ? JSON.stringify(meta) : null,
        tags ? JSON.stringify(tags) : null,
        accent || "peach",
        mediaUrls ? JSON.stringify(mediaUrls) : null,
        req.params.id,
      ]
    );
    const [rows] = await pool.query("SELECT * FROM portfolio_items WHERE id = ?", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: "Not found" });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete("/portfolio/:id", async (req, res, next) => {
  try {
    await pool.query("DELETE FROM portfolio_items WHERE id = ?", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) { next(err); }
});

// ── Orders ──────────────────────────────────────────────────

router.get("/orders", async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT o.id, o.total, o.status, o.stripe_id AS stripeId,
              o.created_at AS createdAt, u.email AS userEmail
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.patch("/orders/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "paid", "shipped", "fulfilled", "cancelled"];
    if (!allowed.includes(status))
      return res.status(400).json({ message: "Invalid status" });

    await pool.query("UPDATE orders SET status=? WHERE id=?", [status, req.params.id]);
    res.json({ id: Number(req.params.id), status });
  } catch (err) { next(err); }
});

// ── Bookings ────────────────────────────────────────────────

router.get("/bookings", async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.id, b.tier, b.booked_at AS bookedAt, b.notes, b.status,
              b.created_at AS createdAt,
              u.email AS userEmail, s.title AS serviceTitle
       FROM bookings b
       LEFT JOIN users u    ON u.id = b.user_id
       LEFT JOIN services s ON s.id = b.service_id
       ORDER BY b.created_at DESC`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.patch("/bookings/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "confirmed", "completed", "cancelled"];
    if (!allowed.includes(status))
      return res.status(400).json({ message: "Invalid status" });

    await pool.query("UPDATE bookings SET status=? WHERE id=?", [status, req.params.id]);
    res.json({ id: Number(req.params.id), status });
  } catch (err) { next(err); }
});

// ── Users ───────────────────────────────────────────────────

router.get("/users", async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, email, role, created_at AS createdAt FROM users ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.patch("/users/:id/role", async (req, res, next) => {
  try {
    const { role } = req.body;
    const allowed = ["user", "moderator", "admin"];
    if (!allowed.includes(role))
      return res.status(400).json({ message: "Invalid role" });

    await pool.query("UPDATE users SET role=? WHERE id=?", [role, req.params.id]);
    res.json({ id: Number(req.params.id), role });
  } catch (err) { next(err); }
});

module.exports = router;
