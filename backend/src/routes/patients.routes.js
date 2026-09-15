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

router.use(
  authorizeRoles(
    ROLES.ADMIN,
    ROLES.CLINICIAN,
    ROLES.STAFF
  )
);

router.get("/", async (req, res, next) => {
  try {
    const { limit, offset } = paginationSchema.parse(req.query);

    const [patientsResult, countResult] = await Promise.all([
      pool.query(
        `
          SELECT
            id,
            first_name,
            last_name,
            date_of_birth,
            diagnosis,
            updated_at
          FROM patients
          ORDER BY last_name ASC, first_name ASC
          LIMIT $1 OFFSET $2
        `,
        [limit, offset]
      ),
      pool.query(`SELECT COUNT(*)::int AS total FROM patients`),
    ]);

    return res.json({
      patients: patientsResult.rows,
      total: countResult.rows[0].total,
      limit,
      offset,
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const result = await pool.query(
      `
        SELECT
          id,
          first_name,
          last_name,
          date_of_birth,
          diagnosis,
          updated_at
        FROM patients
        WHERE id = $1
      `,
      [req.params.id]
    );

    const patient = result.rows[0];

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found.",
      });
    }

    await writeAuditLog({
      userId: req.user.id,
      action: "PATIENT_RECORD_VIEWED",
      req,
      metadata: {
        patientId: patient.id,
        role: req.user.role,
      },
    });

    return res.json({
      patient,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;