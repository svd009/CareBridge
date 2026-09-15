import express from "express";
import { pool } from "../config/db.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

router.use(authenticate);
router.use(authorize("admin"));

router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT
         audit_logs.id,
         audit_logs.action,
         audit_logs.ip_address,
         audit_logs.metadata,
         audit_logs.created_at,
         users.email AS user_email,
         users.role AS user_role,
         patients.first_name,
         patients.last_name
       FROM audit_logs
       LEFT JOIN users ON users.id = audit_logs.user_id
       LEFT JOIN patients ON patients.id = audit_logs.patient_id
       ORDER BY audit_logs.created_at DESC
       LIMIT 100`
    );

    return res.json({ auditLogs: result.rows });
  } catch (error) {
    next(error);
  }
});

export default router;