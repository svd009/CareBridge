import jwt from "jsonwebtoken";

export const ROLES = Object.freeze({
  ADMIN: "admin",
  CLINICIAN: "clinician",
  STAFF: "staff",
});

export function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication token is required.",
    });
  }

  const token = header.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      message: "Authentication token is required.",
    });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "carebridge-api",
      audience: "carebridge-api",
    });

    return next();
  } catch (error) {
    console.error("JWT verification failed:", error.name, error.message);

    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
}

export function authorizeRoles(...allowedRoles) {
  const permittedRoles = new Set(allowedRoles);

  return (req, res, next) => {
    if (!req.user?.role) {
      return res.status(403).json({
        message: "You do not have permission to perform this action.",
      });
    }

    if (!permittedRoles.has(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action.",
      });
    }

    return next();
  };
}