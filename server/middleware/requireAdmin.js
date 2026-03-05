const { verifyToken } = require("./auth");

function requireAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  });
}

module.exports = requireAdmin;
