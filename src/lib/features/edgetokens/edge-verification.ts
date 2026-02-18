import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';

const IV_LEN = 12;
const TAG_LEN = 16;

export function decryptSecret(masterKey: Buffer, secretEnc: Buffer): Buffer {
    if (!Buffer.isBuffer(secretEnc)) {
        throw new Error('secretEnc must be a buffer');
    }

    const iv = secretEnc.subarray(0, IV_LEN);
    const tag = secretEnc.subarray(secretEnc.length - TAG_LEN);
    const cipher = secretEnc.subarray(IV_LEN, secretEnc.length - TAG_LEN);

    const decipher = createDecipheriv('aes-256-gcm', masterKey, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(cipher), decipher.final()]);
}

export function encryptSecret(masterKey: Buffer, secretPlain: string): Buffer {
    const iv = randomBytes(12);

    const cipher = createCipheriv('aes-256-gcm', masterKey, iv);

    const ciphertext = Buffer.concat([
        cipher.update(secretPlain, 'utf8'),
        cipher.final(),
    ]);

    const tag = cipher.getAuthTag();

    return Buffer.concat([iv, ciphertext, tag]);
}
