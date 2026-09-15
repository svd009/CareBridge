import express from "express";
import { pool } from "../config/db.js";
import {
  authenticate,
  authorizeRoles,
  ROLES,
} from "../middleware/auth.js";
import { writeAuditLog } from "../services/audit.service.js";

const router = express.Router();

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
    const result = await pool.query(`
      SELECT
        id,
        first_name,
        last_name,
        date_of_birth,
        diagnosis,
        updated_at
      FROM patients
      ORDER BY last_name ASC, first_name ASC
    `);

    return res.json({
      patients: result.rows,
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