import crypto from 'crypto';
import { NextRequest } from 'next/server';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 32).toString('hex');
  return `${salt}$${derived}`;
}

export function verifyPassword(password: string, passwordHash: string): boolean {
  try {
    const parts = passwordHash.split('$');
    if (parts.length !== 2) return false;
    const [salt, digestHex] = parts;
    const candidate = crypto.scryptSync(password, salt, 32);
    const expected = Buffer.from(digestHex, 'hex');
    if (candidate.length !== expected.length) return false;
    return crypto.timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

export function getCurrentUser(_req?: NextRequest): string | null {
  // Static AUTH_TOKEN bearer check disabled for now.
  return null;
}
