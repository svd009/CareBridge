import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication token is required.",
    });
  }

  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET, {
      issuer: "carebridge-api",
      audience: "carebridge-api",
    });

    next();
  } catch (error) {
    console.error("JWT verification failed:", error.name, error.message);

    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
}