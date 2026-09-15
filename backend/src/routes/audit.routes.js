import express from "express";
import { z } from "zod";
import { pool } from "../config/db.js";
import {
  authenticate,
  authorizeRoles,
  ROLES,
} from "../middleware/auth.js";
import { writeAuditLog } from "../services/audit.service.js";

const router = express.Router();

const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

router.use(authenticate);

router.use(async (req, res, next) => {
  if (req.user.role === ROLES.ADMIN) {
    return next();
  }

  await writeAuditLog({
    userId: req.user.id,
    action: "AUDIT_LOG_ACCESS_DENIED",
    req,
    metadata: {
      role: req.user.role,
    },
  });

  return res.status(403).json({
    message: "Administrator access is required to view audit logs.",
  });
});

router.use(authorizeRoles(ROLES.ADMIN));

router.get("/", async (req, res, next) => {
  try {
    const { limit, offset } = paginationSchema.parse(req.query);

    const [auditLogsResult, countResult] = await Promise.all([
      pool.query(
        `
          SELECT
            audit_logs.id,
            audit_logs.action,
            audit_logs.ip_address,
            audit_logs.metadata,
            audit_logs.created_at,
            users.email AS user_email,
            users.role AS user_role
          FROM audit_logs
          LEFT JOIN users ON users.id = audit_logs.user_id
          ORDER BY audit_logs.created_at DESC
          LIMIT $1 OFFSET $2
        `,
        [limit, offset]
      ),
      pool.query(`SELECT COUNT(*)::int AS total FROM audit_logs`),
    ]);

    return res.json({
      auditLogs: auditLogsResult.rows,
      total: countResult.rows[0].total,
      limit,
      offset,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;