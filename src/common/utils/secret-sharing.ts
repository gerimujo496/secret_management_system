import { scryptSync } from 'crypto';

export function generateKey(password: string) {
  const key = scryptSync(password, 'salt', 32);
  return key.toString('hex');
}

export function generateSixDigitCode(): number {
  return Math.floor(100000 + Math.random() * 900000);
}
