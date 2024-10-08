import { createCipheriv, createDecipheriv, scryptSync } from 'crypto';

const IV = Buffer.alloc(16, 0);

export function encrypt(value: string, password: string) {
  const key = scryptSync(password, 'salt', 32);
  const cipher = createCipheriv('aes-256-ctr', key, IV);

  const encryptedData = Buffer.concat([cipher.update(value), cipher.final()]);
  
  return encryptedData.toString('hex');
}

export function decrypt(encryptedData: string, password: string) {
  const key = scryptSync(password, 'salt', 32);
  const decipher = createDecipheriv('aes-256-ctr', key, IV);
  
  const decryptedData = Buffer.concat([
    decipher.update(Buffer.from(encryptedData, 'hex')),
    decipher.final(),
  ]);

  return decryptedData.toString();
}
