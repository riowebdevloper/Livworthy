import crypto from 'crypto';
import { getRequiredEnv } from './env';

export type UserRole =
  | 'ADMIN'
  | 'DATA_EDITOR'
  | 'CONTENT_EDITOR'
  | 'REVIEWER'
  | 'SEO_REVIEWER'
  | 'READ_ONLY';

export type Permission =
  | 'manage_users'
  | 'view_audit_logs'
  | 'edit_tax_rules'
  | 'edit_cost_data'
  | 'edit_content'
  | 'review_content'
  | 'publish_content'
  | 'approve_indexing'
  | 'trigger_fx_refresh';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    'manage_users',
    'view_audit_logs',
    'edit_tax_rules',
    'edit_cost_data',
    'edit_content',
    'review_content',
    'publish_content',
    'approve_indexing',
    'trigger_fx_refresh',
  ],
  DATA_EDITOR: ['edit_tax_rules', 'edit_cost_data', 'trigger_fx_refresh'],
  CONTENT_EDITOR: ['edit_content'],
  REVIEWER: ['review_content', 'publish_content'],
  SEO_REVIEWER: ['review_content', 'approve_indexing'],
  READ_ONLY: [],
};

export interface AuthSession {
  userId: string;
  email: string;
  role: UserRole;
  expiresAt: number;
}

function getJwtSecret(): string {
  return getRequiredEnv('ADMIN_SESSION_SECRET');
}

export class AuthService {
  public static hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')): string {
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  public static verifyPassword(password: string, storedHash: string): boolean {
    const [salt, originalHash] = storedHash.split(':');
    if (!salt || !originalHash) return false;
    const testHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    try {
      return crypto.timingSafeEqual(Buffer.from(testHash, 'hex'), Buffer.from(originalHash, 'hex'));
    } catch {
      return false;
    }
  }

  public static createSessionToken(user: { id: string; email: string; role: UserRole }): string {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      expiresAt: Date.now() + 24 * 3600 * 1000, // 24 hours
    };
    const serialized = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto.createHmac('sha256', getJwtSecret()).update(serialized).digest('base64url');
    return `${serialized}.${signature}`;
  }

  public static verifySessionToken(token: string): AuthSession | null {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [serialized, signature] = parts;
    const expectedSignature = crypto.createHmac('sha256', getJwtSecret()).update(serialized).digest('base64url');

    try {
      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        return null;
      }
      const payload: AuthSession = JSON.parse(Buffer.from(serialized, 'base64url').toString('utf8'));
      if (payload.expiresAt < Date.now()) {
        return null;
      }
      return payload;
    } catch {
      return null;
    }
  }

  public static hasPermission(role: UserRole, permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  }

  /**
   * RFC 6238 TOTP (Time-based One-Time Password) verification
   */
  public static verifyTotp(secret: string, token: string, windowSteps = 1): boolean {
    if (!secret || !token || token.length !== 6) return false;
    const timeStepSeconds = 30;
    const currentStep = Math.floor(Date.now() / 1000 / timeStepSeconds);

    for (let stepOffset = -windowSteps; stepOffset <= windowSteps; stepOffset++) {
      const step = currentStep + stepOffset;
      const stepBuffer = Buffer.alloc(8);
      stepBuffer.writeBigInt64BE(BigInt(step));

      const hmac = crypto.createHmac('sha1', Buffer.from(secret, 'ascii'));
      hmac.update(stepBuffer);
      const digest = hmac.digest();

      const offset = digest[digest.length - 1] & 0xf;
      const code =
        ((digest[offset] & 0x7f) << 24) |
        ((digest[offset + 1] & 0xff) << 16) |
        ((digest[offset + 2] & 0xff) << 8) |
        (digest[offset + 3] & 0xff);

      const otp = (code % 1000000).toString().padStart(6, '0');
      if (crypto.timingSafeEqual(Buffer.from(otp), Buffer.from(token))) {
        return true;
      }
    }
    return false;
  }
}
