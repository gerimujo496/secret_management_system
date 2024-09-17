import { scryptSync } from 'crypto';

export function generateKey(password: string) {
  const key = scryptSync(password, 'salt', 32);
  return key.toString('hex');
}
