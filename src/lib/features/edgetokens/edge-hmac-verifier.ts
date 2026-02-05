import type { RequestHandler } from 'express';
import type { EdgeService } from '../../services/index.js';
import { createHash, createHmac } from 'node:crypto';
import { timingSafeEqual } from 'crypto';

const REQUEST_LIFETIME = 5 * 60 * 1000;

export const hmacSignatureVerifyTokenRequest = (
    edgeService: EdgeService,
): RequestHandler => {
    return async (req, res, next) => {
        try {
            const auth = req.headers.authorization || '';
            const m = auth.match(/^HMAC ([^:]+):(.+)$/);
            if (!m) {
                res.status(401).json({
                    error: 'Missing HMAC authorization header',
                });
                return;
            }
            const clientId = m[1];
            const providedSig = m[2];

            const timestamp = req.headers['x-timestamp'] as string;
            const nonce = req.headers['x-nonce'] as string;
            const bodyHash = req.headers['content-sha256'] as string;
            if (!timestamp || !nonce || !bodyHash) {
                res.status(401).json({ error: 'Missing content headers' });
                return;
            }
            const now = Date.now();
            const ts = Date.parse(timestamp);
            if (Math.abs(now - ts) > REQUEST_LIFETIME) {
                res.status(401).json({ error: 'Stale request' });
                return;
            }

            const safeToUse = await edgeService.notSeenBefore({
                clientId,
                nonce,
                expiresAt: new Date(now + 5 * 60 * 1000),
            });
            if (!safeToUse) {
                res.status(401).json({ error: 'Replay detected' });
                return;
            }

            const client = await edgeService.loadClient(clientId);
            if (!client) {
                res.status(401).json({ error: 'Unknown client' });
                return;
            }

            const bodyAsString = JSON.stringify(req.body || '');
            const computedHash = createHash('sha256')
                .update(bodyAsString)
                .digest('hex');
            if (computedHash !== bodyHash) {
                res.status(401).json({ error: 'Body tampering detected' });
                return;
            }

            const canonical =
                req.method.toUpperCase() +
                '\n' +
                '/edge/issue-token' +
                '\n' +
                timestamp +
                '\n' +
                nonce +
                '\n' +
                bodyHash;
            const secret = edgeService
                .decryptedClientSecret(client)
                .toString('utf-8');

            const expectedSig = createHmac(
                'sha256',
                Buffer.from(secret, 'base64url'),
            )
                .update(canonical)
                .digest('base64url');
            if (
                !timingSafeEqual(
                    Buffer.from(expectedSig),
                    Buffer.from(providedSig),
                )
            ) {
                res.status(401).json({ error: 'Signature mismatch' });
                return;
            }
            res.locals.clientId = clientId;
            next();
        } catch (e) {
            res.status(401).json({
                error: 'Authenticating request failed',
                stack: e,
            });
            return;
        }
    };
};
