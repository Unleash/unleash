import { decryptSecret, encryptSecret } from './edge-verification.js';
import { randomBytes } from 'node:crypto';

test('decrypt/encrypt round trip works', () => {
    const clientSecret = 'enterprise-edge-secret';
    const masterSecret = 'EzyLvZ7WF22dH8LzKg4Sk8cMvqzspAm4s6RlmniATT4=';
    const masterBuffer = Buffer.from(masterSecret, 'base64');
    const encrypted = encryptSecret(masterBuffer, clientSecret);
    const decrypted = decryptSecret(masterBuffer, encrypted);
    expect(decrypted.toString('utf-8')).toBe(clientSecret);
});

test('decrypt/encrypt with random strings also works', () => {
    const clientSecret = randomBytes(32).toString('base64url');
    const masterSecret = randomBytes(32);
    const encrypted = encryptSecret(masterSecret, clientSecret);
    const decrypted = decryptSecret(masterSecret, encrypted);
    expect(decrypted.toString('utf-8')).toEqual(clientSecret);
});
