import crypto from 'crypto';

export const aes256gcm = (key: Buffer) => {
  const encrypt = (str: string): string => {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    const enc1 = cipher.update(str, 'utf8');
    const enc2 = cipher.final();
    const authTag = cipher.getAuthTag();

    const encrypted = Buffer.concat([enc1, enc2, iv, authTag]);

    return encrypted.toString('base64');
  };

  const decrypt = (enc: string): string => {
    const encryptedBuffer = Buffer.from(enc, 'base64');

    const iv = encryptedBuffer.slice(encryptedBuffer.length - 28, encryptedBuffer.length - 16);
    const authTag = encryptedBuffer.slice(encryptedBuffer.length - 16);
    const encryptedData = encryptedBuffer.slice(0, encryptedBuffer.length - 28);

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  };

  return {
    encrypt,
    decrypt,
  };
};
