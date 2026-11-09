import { createPublicKey, publicEncrypt } from 'node:crypto';

export const sealForInstance = (
    publicKey: string,
    connection: { accessToken: string; team: { id: string; name: string } },
): string =>
    publicEncrypt(
        {
            key: createPublicKey({
                key: Buffer.from(publicKey, 'base64url'),
                format: 'der',
                type: 'spki',
            }),
            oaepHash: 'sha256',
        },
        Buffer.from(JSON.stringify(connection)),
    ).toString('base64url');
