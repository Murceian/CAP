const router = require("express").Router();
const pool = require("../db");
const { verifyToken } = require("../middleware/auth");

// POST /api/orders  — create order + order_items
router.post("/", verifyToken, async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { items } = req.body; // [{ productId, qty, price }]
    if (!items?.length)
      return res.status(400).json({ message: "No items provided" });

    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    await conn.beginTransaction();

    const [orderResult] = await conn.query(
      "INSERT INTO orders (user_id, total) VALUES (?, ?)",
      [req.user.id, total.toFixed(2)]
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      await conn.query(
        "INSERT INTO order_items (order_id, product_id, qty, price) VALUES (?, ?, ?, ?)",
        [orderId, item.productId, item.qty, item.price]
      );
    }

    await conn.commit();

    const [orderRows] = await pool.query(
      `SELECT id, total, status, stripe_id AS stripeId, created_at AS createdAt
       FROM orders WHERE id = ?`,
      [orderId]
    );
    res.status(201).json(orderRows[0]);
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

// GET /api/orders  — user's orders
router.get("/", verifyToken, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, total, status, stripe_id AS stripeId, created_at AS createdAt
       FROM orders
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id  — single order with items
router.get("/:id", verifyToken, async (req, res, next) => {
  try {
    const [orderRows] = await pool.query(
      `SELECT id, total, status, stripe_id AS stripeId, created_at AS createdAt
       FROM orders
       WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (!orderRows[0])
      return res.status(404).json({ message: "Order not found" });

    const [itemRows] = await pool.query(
      `SELECT oi.id, oi.qty, oi.price, p.title, p.accent
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id = ?`,
      [req.params.id]
    );

    res.json({ ...orderRows[0], items: itemRows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
