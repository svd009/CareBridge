import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import { z } from "zod";
import { pool } from "../config/db.js";

const router = express.Router();

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

const mfaTokenSchema = z.object({
  setupToken: z.string().min(1),
  token: z.string().regex(/^\d{6}$/, "MFA code must contain 6 digits."),
});

const setupTokenSchema = z.object({
  setupToken: z.string().min(1),
});

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

function signSetupToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      purpose: "mfa_setup",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "10m",
      issuer: "carebridge-api",
      audience: "carebridge-mfa-setup",
    }
  );
}

function verifySetupToken(setupToken) {
  return jwt.verify(setupToken, process.env.JWT_SECRET, {
    issuer: "carebridge-api",
    audience: "carebridge-mfa-setup",
  });
}

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
      `SELECT id, email, password_hash, role, mfa_enabled
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

      return res.status(401).json({ message: "Invalid email or password." });
    }

    await writeAuditLog({
      userId: user.id,
      action: "LOGIN_PASSWORD_VERIFIED",
      req,
    });

    const setupToken = signSetupToken(user);

    if (!user.mfa_enabled) {
      return res.json({
        mfaRequired: true,
        mfaSetupRequired: true,
        setupToken,
        message:
          "Multi-factor authentication setup is required before completing sign-in.",
      });
    }

    return res.json({
      mfaRequired: true,
      mfaSetupRequired: false,
      setupToken,
      message: "Enter your authenticator-app code to complete sign-in.",
    });
  } catch (error) {
    next(error);
  }
});

router.post("/mfa/setup", async (req, res, next) => {
  try {
    const { setupToken } = setupTokenSchema.parse(req.body);
    const claims = verifySetupToken(setupToken);

    if (claims.purpose !== "mfa_setup") {
      return res.status(401).json({ message: "Invalid MFA setup request." });
    }

    const userResult = await pool.query(
      `SELECT id, email, mfa_enabled
       FROM users
       WHERE id = $1 AND is_active = true`,
      [claims.id]
    );

    const user = userResult.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Invalid MFA setup request." });
    }

    if (user.mfa_enabled) {
      return res.status(409).json({ message: "MFA is already enabled." });
    }

    const secret = speakeasy.generateSecret({
      name: `CareBridge (${user.email})`,
      issuer: "CareBridge",
      length: 20,
    });

    await pool.query(
      `UPDATE users
       SET mfa_secret = $1
       WHERE id = $2`,
      [secret.base32, user.id]
    );

    await writeAuditLog({
      userId: user.id,
      action: "MFA_SETUP_STARTED",
      req,
    });

    return res.json({
      otpauthUrl: secret.otpauth_url,
      manualEntryKey: secret.base32,
      message:
        "Add this account to an authenticator app, then verify its current 6-digit code.",
    });
  } catch (error) {
    next(error);
  }
});

router.post("/mfa/confirm", async (req, res, next) => {
  try {
    const { setupToken, token } = mfaTokenSchema.parse(req.body);
    const claims = verifySetupToken(setupToken);

    if (claims.purpose !== "mfa_setup") {
      return res.status(401).json({ message: "Invalid MFA confirmation request." });
    }

    const result = await pool.query(
      `SELECT id, mfa_secret, mfa_enabled
       FROM users
       WHERE id = $1 AND is_active = true`,
      [claims.id]
    );

    const user = result.rows[0];

    if (!user || user.mfa_enabled || !user.mfa_secret) {
      return res.status(401).json({ message: "Invalid MFA confirmation request." });
    }

    const valid = speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (!valid) {
      await writeAuditLog({
        userId: user.id,
        action: "MFA_SETUP_VERIFICATION_FAILED",
        req,
      });

      return res.status(401).json({ message: "Invalid MFA code." });
    }

    await pool.query(
      `UPDATE users
       SET mfa_enabled = true
       WHERE id = $1`,
      [user.id]
    );

    await writeAuditLog({
      userId: user.id,
      action: "MFA_ENABLED",
      req,
    });

    return res.json({
      message: "MFA is enabled. Sign in again to complete authentication.",
    });
  } catch (error) {
    next(error);
  }
});

router.post("/mfa/verify", async (req, res, next) => {
  try {
    const { setupToken, token } = mfaTokenSchema.parse(req.body);
    const claims = verifySetupToken(setupToken);

    if (claims.purpose !== "mfa_setup") {
      return res.status(401).json({ message: "Invalid MFA verification request." });
    }

    const result = await pool.query(
      `SELECT id, email, role, mfa_secret, mfa_enabled
       FROM users
       WHERE id = $1 AND is_active = true`,
      [claims.id]
    );

    const user = result.rows[0];

    if (!user || !user.mfa_enabled || !user.mfa_secret) {
      return res.status(401).json({ message: "MFA enrollment is required." });
    }

    const valid = speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (!valid) {
      await writeAuditLog({
        userId: user.id,
        action: "MFA_VERIFICATION_FAILED",
        req,
      });

      return res.status(401).json({ message: "Invalid MFA code." });
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
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;