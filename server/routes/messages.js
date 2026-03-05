const router = require("express").Router();
const pool = require("../db");
const { verifyToken } = require("../middleware/auth");

// GET /api/conversations  — user's conversations
router.get("/conversations", verifyToken, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         c.id,
         c.subject,
         c.created_at AS createdAt,
         (
           SELECT body FROM messages m
           WHERE m.conversation_id = c.id
           ORDER BY m.sent_at DESC LIMIT 1
         ) AS lastMessage
       FROM conversations c
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/conversations  — start a new conversation
router.post("/conversations", verifyToken, async (req, res, next) => {
  try {
    const { subject } = req.body;
    const [result] = await pool.query(
      "INSERT INTO conversations (user_id, subject) VALUES (?, ?)",
      [req.user.id, subject || null]
    );
    const [rows] = await pool.query(
      "SELECT id, subject, created_at AS createdAt FROM conversations WHERE id = ?",
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET /api/messages/:convId  — messages in a conversation
router.get("/:convId", verifyToken, async (req, res, next) => {
  try {
    // Verify user owns this conversation
    const [conv] = await pool.query(
      "SELECT id FROM conversations WHERE id = ? AND user_id = ?",
      [req.params.convId, req.user.id]
    );
    if (!conv[0])
      return res.status(404).json({ message: "Conversation not found" });

    const [rows] = await pool.query(
      `SELECT
         m.id,
         m.body,
         m.sent_at     AS sentAt,
         m.sender_id   AS senderId,
         u.email       AS senderEmail,
         u.role        AS senderRole
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.conversation_id = ?
       ORDER BY m.sent_at ASC`,
      [req.params.convId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/messages  — send a message
router.post("/", verifyToken, async (req, res, next) => {
  try {
    const { conversationId, body } = req.body;
    if (!conversationId || !body?.trim())
      return res
        .status(400)
        .json({ message: "conversationId and body are required" });

    // Verify user owns this conversation (or is admin)
    const [conv] = await pool.query(
      "SELECT id FROM conversations WHERE id = ? AND user_id = ?",
      [conversationId, req.user.id]
    );
    if (!conv[0] && req.user.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });

    const [result] = await pool.query(
      "INSERT INTO messages (conversation_id, sender_id, body) VALUES (?, ?, ?)",
      [conversationId, req.user.id, body.trim()]
    );
    const [rows] = await pool.query(
      "SELECT id, body, sent_at AS sentAt, sender_id AS senderId FROM messages WHERE id = ?",
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
