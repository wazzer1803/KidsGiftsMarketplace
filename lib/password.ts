import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SCRYPT_KEY_LENGTH = 64;

function toBuffer(value: string) {
  return Buffer.from(value, "hex");
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, passwordHash: string) {
  if (!passwordHash || !passwordHash.startsWith("scrypt$")) {
    return false;
  }

  const parts = passwordHash.split("$");
  if (parts.length !== 3) {
    return false;
  }

  const [, salt, storedHashHex] = parts;
  const derivedHashHex = scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString("hex");

  const storedHash = toBuffer(storedHashHex);
  const derivedHash = toBuffer(derivedHashHex);

  if (storedHash.length !== derivedHash.length) {
    return false;
  }

  return timingSafeEqual(storedHash, derivedHash);
}
