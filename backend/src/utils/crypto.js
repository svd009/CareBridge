import crypto from "crypto";

const algorithm = "aes-256-gcm";

function getKey() {
  const key = Buffer.from(process.env.FIELD_ENCRYPTION_KEY, "hex");

  if (key.length !== 32) {
    throw new Error("FIELD_ENCRYPTION_KEY must be a 32-byte hex value.");
  }

  return key;
}

export function encryptField(value) {
  if (!value) return null;

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, getKey(), iv);

  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final()
  ]);

  const tag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptField(payload) {
  if (!payload) return null;

  const [ivHex, tagHex, encryptedHex] = payload.split(":");
  const decipher = crypto.createDecipheriv(
    algorithm,
    getKey(),
    Buffer.from(ivHex, "hex")
  );

  decipher.setAuthTag(Buffer.from(tagHex, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final()
  ]);

  return decrypted.toString("utf8");
}