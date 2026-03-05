const router = require("express").Router();
const pool = require("../db");
const { verifyToken } = require("../middleware/auth");

// POST /api/bookings
router.post("/", verifyToken, async (req, res, next) => {
  try {
    const { serviceId, tier, bookedAt, notes } = req.body;
    if (!serviceId || !tier)
      return res.status(400).json({ message: "serviceId and tier are required" });

    const [result] = await pool.query(
      "INSERT INTO bookings (user_id, service_id, tier, booked_at, notes) VALUES (?, ?, ?, ?, ?)",
      [req.user.id, serviceId, tier, bookedAt || null, notes || null]
    );

    const [rows] = await pool.query(
      `SELECT
         id,
         service_id  AS serviceId,
         tier,
         booked_at   AS bookedAt,
         notes,
         status,
         created_at  AS createdAt
       FROM bookings WHERE id = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET /api/bookings  — user's own bookings
router.get("/", verifyToken, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         b.id,
         b.tier,
         b.booked_at   AS bookedAt,
         b.notes,
         b.status,
         b.created_at  AS createdAt,
         s.title       AS serviceTitle,
         s.accent
       FROM bookings b
       JOIN services s ON s.id = b.service_id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
