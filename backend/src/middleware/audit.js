import { pool } from "../config/db.js";

export function audit(action) {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = async (body) => {
      if (res.statusCode < 400 && req.user) {
        const patientId = req.params.id || body?.patient?.id || null;

        await pool.query(
          `INSERT INTO audit_logs (user_id, patient_id, action, ip_address, metadata)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            req.user.id,
            patientId,
            action,
            req.ip,
            JSON.stringify({
              method: req.method,
              path: req.originalUrl,
              role: req.user.role
            })
          ]
        );
      }

      return originalJson(body);
    };

    next();
  };
}