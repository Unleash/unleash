import crypto from 'crypto';

export const constantTimeCompare = (a: string, b: string): boolean => {
    if (!a || !b || a.length !== b.length) {
        return false;
    }

    return crypto.timingSafeEqual(
        Buffer.from(a, 'utf8'),
        Buffer.from(b, 'utf8'),
    );
};
