import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { pool } from "../config/db.js";

const router = express.Router();

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

function signAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
      issuer: "carebridge-api",
      audience: "carebridge-api",
    }
  );
}

async function writeAuditLog({ userId = null, action, req, metadata = {} }) {
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

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const result = await pool.query(
      `SELECT id, email, password_hash, role
       FROM users
       WHERE email = $1 AND is_active = true`,
      [email]
    );

    const user = result.rows[0];

    const passwordValid =
      user && (await bcrypt.compare(password, user.password_hash));

    if (!passwordValid) {
      await writeAuditLog({
        action: "LOGIN_FAILED",
        req,
        metadata: { email },
      });

      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const accessToken = signAccessToken(user);

    await writeAuditLog({
      userId: user.id,
      action: "LOGIN_SUCCEEDED",
      req,
    });

    return res.json({
      accessToken,
      user: {
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;