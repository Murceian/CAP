const router = require("express").Router();
const pool = require("../db");

// GET /api/products
router.get("/", async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         id,
         title,
         subtitle,
         price,
         price_label      AS priceLabel,
         meta,
         tags,
         accent,
         image_url        AS imageUrl,
         created_at       AS createdAt
       FROM products
       ORDER BY created_at ASC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         id,
         title,
         subtitle,
         price,
         price_label      AS priceLabel,
         meta,
         tags,
         accent,
         image_url        AS imageUrl,
         created_at       AS createdAt
       FROM products
       WHERE id = ?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: "Product not found" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
