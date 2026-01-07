import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

/**
 * Generate a 2FA secret
 */
export function generateSecret(email: string) {
  return speakeasy.generateSecret({
    name: `Ajans Panel (${email})`,
    length: 20
  });
}

// Alias for backward compatibility
export const generate2FASecret = generateSecret;

/**
 * Generate QR code image data URL
 */
export async function generateQRCode(otpauthUrl: string): Promise<string> {
  return QRCode.toDataURL(otpauthUrl);
}

// Alias for backward compatibility
export const generate2FAQRCode = generateQRCode;

/**
 * Verify a 2FA token
 */
export function verifyToken(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2 // Allow 2 time steps before/after
  });
}

// Alias for backward compatibility
export const verify2FAToken = verifyToken;

/**
 * Generate backup codes
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = Math.random().toString(36).substr(2, 8).toUpperCase();
    codes.push(code);
  }
  return codes;
}

