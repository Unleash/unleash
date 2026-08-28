import crypto from 'node:crypto';

export const createTokenVerifier = (token: string): string =>
    crypto.createHash('sha256').update(token).digest('base64url');

export const verifyToken = (token: string, verifier: string): boolean => {
    const expected = Buffer.from(createTokenVerifier(token));
    const actual = Buffer.from(verifier);
    return (
        expected.length === actual.length &&
        crypto.timingSafeEqual(expected, actual)
    );
};
