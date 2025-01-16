import CryptoJS from 'crypto-js';

const SECRET_KEY = `${process.env.ENCRYPTION_KEY}`;

export const encryptData = (data: object | string): string => {
  const jsonData = typeof data === 'string' ? data : JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonData, SECRET_KEY).toString();
};

export const decryptData = (ciphertext: string): object | string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  try {
    return JSON.parse(decrypted);
  } catch {
    return decrypted;
  }
};
