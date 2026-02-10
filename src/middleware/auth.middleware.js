const jwt = require("jsonwebtoken");

/**
 * Verify JWT Token
 * - Validates Bearer format
 * - Verifies signature
 * - Validates tenant isolation
 * - Ensures user still exists in tenant DB
 */
exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ message: "Invalid authorization format." });
    }

    const token = parts[1];

    // Verify token signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Tenant isolation check (CRITICAL for SaaS)
    if (decoded.tenant !== req.tenant) {
      return res.status(403).json({ message: "Tenant mismatch." });
    }

    // Validate user still exists inside tenant DB
    const [rows] = await req.db.query(
      "SELECT id, role FROM users WHERE id = ?",
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "User no longer exists." });
    }

    // Attach user to request
    req.user = {
      id: rows[0].id,
      role: rows[0].role,
      tenant: decoded.tenant
    };

    next();

  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired." });
    }

    return res.status(401).json({ message: "Invalid token." });
  }
};


/**
 * Admin-only middleware
 */
exports.isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only." });
  }

  next();
};
