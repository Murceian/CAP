const { verifyToken } = require("./auth");

/**
 * Usage: requireRole("moderator", "admin")
 * Returns middleware that checks req.user.role is in the allowed list.
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    verifyToken(req, res, () => {
      if (!allowedRoles.includes(req.user?.role)) {
        return res.status(403).json({
          message: `Requires one of: ${allowedRoles.join(", ")}`,
        });
      }
      next();
    });
  };
}

module.exports = requireRole;
