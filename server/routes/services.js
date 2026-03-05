const router = require("express").Router();
const pool = require("../db");

// GET /api/services
router.get("/", async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         id,
         title,
         subtitle,
         price_label  AS priceLabel,
         tiers,
         meta,
         tags,
         accent,
         image_url    AS imageUrl,
         created_at   AS createdAt
       FROM services
       ORDER BY created_at ASC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/services/:id
router.get("/:id", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         id,
         title,
         subtitle,
         price_label  AS priceLabel,
         tiers,
         meta,
         tags,
         accent,
         image_url    AS imageUrl,
         created_at   AS createdAt
       FROM services
       WHERE id = ?`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: "Service not found" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
