const router = require("express").Router();
const pool = require("../db");

// GET /api/portfolio
router.get("/", async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         id,
         title,
         subtitle,
         meta,
         tags,
         accent,
         media_urls  AS mediaUrls,
         created_at  AS createdAt
       FROM portfolio_items
       ORDER BY created_at ASC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/portfolio/:id
router.get("/:id", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         id,
         title,
         subtitle,
         meta,
         tags,
         accent,
         media_urls  AS mediaUrls,
         created_at  AS createdAt
       FROM portfolio_items
       WHERE id = ?`,
      [req.params.id]
    );
    if (!rows[0])
      return res.status(404).json({ message: "Portfolio item not found" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
