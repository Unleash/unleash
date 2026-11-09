import { expect, test } from 'vitest';
import { createTokenVerifier, verifyToken } from './token-verifier.js';

test('creates and verifies token verifiers', () => {
    const token = 'user:v2_abcdefghijklmnopqrstuv_test-secret';
    const verifier = createTokenVerifier(token);

    expect(verifyToken(token, verifier)).toBe(true);
    expect(verifyToken(`${token}-different`, verifier)).toBe(false);
    expect(verifyToken(token, 'different-verifier')).toBe(false);
});
