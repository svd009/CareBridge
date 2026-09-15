import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { pool } from "../config/db.js";
import { writeAuditLog } from "../services/audit.service.js";

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

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const result = await pool.query(
      `SELECT id, email, password_hash, role
       FROM users
       WHERE email = $1
         AND is_active = true`,
      [email]
    );

    const user = result.rows[0];

    const passwordValid =
      user && (await bcrypt.compare(password, user.password_hash));

    if (!passwordValid) {
      await writeAuditLog({
        action: "LOGIN_FAILED",
        req,
        metadata: {
          email,
        },
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
      metadata: {
        role: user.role,
      },
    });

    return res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;