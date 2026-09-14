import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import { z } from "zod";
import { pool } from "../config/db.js";

const router = express.Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const mfaSchema = z.object({
  userId: z.number().int(),
  token: z.string().length(6)
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const result = await pool.query(
      `SELECT id, email, password_hash, role, mfa_secret
       FROM users
       WHERE email = $1 AND is_active = true`,
      [email]
    );

    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    return res.json({
      mfaRequired: true,
      userId: user.id,
      message: "Enter your authenticator-app code to complete sign-in."
    });
  } catch (error) {
    next(error);
  }
});

router.post("/mfa/verify", async (req, res, next) => {
  try {
    const { userId, token } = mfaSchema.parse(req.body);

    const result = await pool.query(
      `SELECT id, email, role, mfa_secret
       FROM users
       WHERE id = $1 AND is_active = true`,
      [userId]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Invalid authentication request." });
    }

    const valid = speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: "base32",
      token,
      window: 1
    });

    if (!valid) {
      return res.status(401).json({ message: "Invalid MFA code." });
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
    );

    return res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;