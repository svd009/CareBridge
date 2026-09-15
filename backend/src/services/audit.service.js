import { pool } from "../config/db.js";

export async function writeAuditLog({
  userId = null,
  action,
  req,
  metadata = {},
}) {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, ip_address, metadata)
       VALUES ($1, $2, $3, $4)`,
      [
        userId,
        action,
        req.ip,
        JSON.stringify({
          method: req.method,
          path: req.originalUrl,
          ...metadata,
        }),
      ]
    );
  } catch (error) {
    console.error("Failed to write audit log:", error.message);
  }
}