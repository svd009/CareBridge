import express from "express";
import { z } from "zod";
import { pool } from "../config/db.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { audit } from "../middleware/audit.js";
import { decryptField, encryptField } from "../utils/crypto.js";

const router = express.Router();

const patientIdSchema = z.coerce.number().int().positive();

const patientSchema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  dateOfBirth: z.string().date(),
  diagnosis: z.string().trim().min(1).max(500),
  clinicalNotes: z.string().trim().max(5000).optional(),
});

router.use(authenticate);

router.get(
  "/",
  authorize("admin", "physician", "nurse", "billing"),
  async (req, res, next) => {
    try {
      const result = await pool.query(
        `SELECT id, first_name, last_name, date_of_birth, diagnosis, updated_at
         FROM patients
         ORDER BY updated_at DESC`
      );

      const patients =
        req.user.role === "billing"
          ? result.rows.map(({ diagnosis, ...patient }) => patient)
          : result.rows;

      return res.json({ patients });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/:id", audit("PATIENT_RECORD_VIEWED"), async (req, res, next) => {
  try {
    const patientId = patientIdSchema.parse(req.params.id);

    const result = await pool.query(
      `SELECT id, first_name, last_name, date_of_birth, diagnosis,
              encrypted_clinical_notes, updated_at
       FROM patients
       WHERE id = $1`,
      [patientId]
    );

    const patient = result.rows[0];

    if (!patient) {
      return res.status(404).json({ message: "Patient record not found." });
    }

    if (req.user.role === "billing") {
      delete patient.diagnosis;
      delete patient.encrypted_clinical_notes;
    } else {
      patient.clinical_notes = decryptField(patient.encrypted_clinical_notes);
      delete patient.encrypted_clinical_notes;
    }

    return res.json({ patient });
  } catch (error) {
    next(error);
  }
});

router.put(
  "/:id",
  authorize("admin", "physician"),
  audit("PATIENT_RECORD_UPDATED"),
  async (req, res, next) => {
    try {
      const patientId = patientIdSchema.parse(req.params.id);
      const payload = patientSchema.parse(req.body);

      const encryptedNotes = payload.clinicalNotes
        ? encryptField(payload.clinicalNotes)
        : null;

      const result = await pool.query(
        `UPDATE patients
         SET first_name = $1,
             last_name = $2,
             date_of_birth = $3,
             diagnosis = $4,
             encrypted_clinical_notes = COALESCE($5, encrypted_clinical_notes),
             updated_at = NOW()
         WHERE id = $6
         RETURNING id, first_name, last_name, date_of_birth, diagnosis, updated_at`,
        [
          payload.firstName,
          payload.lastName,
          payload.dateOfBirth,
          payload.diagnosis,
          encryptedNotes,
          patientId,
        ]
      );

      if (!result.rows[0]) {
        return res.status(404).json({ message: "Patient record not found." });
      }

      return res.json({ patient: result.rows[0] });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:id/export",
  authorize("admin", "physician"),
  audit("PATIENT_RECORD_EXPORTED"),
  async (req, res, next) => {
    try {
      const patientId = patientIdSchema.parse(req.params.id);

      const result = await pool.query(
        `SELECT id, first_name, last_name, date_of_birth, diagnosis,
                encrypted_clinical_notes
         FROM patients
         WHERE id = $1`,
        [patientId]
      );

      const patient = result.rows[0];

      if (!patient) {
        return res.status(404).json({ message: "Patient record not found." });
      }

      return res.json({
        export: {
          id: patient.id,
          firstName: patient.first_name,
          lastName: patient.last_name,
          dateOfBirth: patient.date_of_birth,
          diagnosis: patient.diagnosis,
          clinicalNotes: decryptField(patient.encrypted_clinical_notes),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;