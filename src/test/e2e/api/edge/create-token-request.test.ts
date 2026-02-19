import {
    type IUnleashTest,
    setupAppWithCustomConfig,
} from '../../helpers/test-helper.js';
import getLogger from '../../../fixtures/no-logger.js';
import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import { createHmac, randomBytes } from 'node:crypto';
import type { EdgeEnvironmentsProjectsListSchema } from '../../../../lib/openapi/index.js';
import { createHash } from 'crypto';
import { ApiTokenType } from '../../../../lib/server-impl.js';
import { subMinutes } from 'date-fns';

let app: IUnleashTest;
let db: ITestDb;
const clientId = 'enterprise-edge';
const edgeClientSecret = randomBytes(32).toString('base64url');
const edgeMasterKey = randomBytes(32).toString('base64');
const environment = 'development';
describe('HMAC authenticated create token requests', () => {
    beforeAll(async () => {
        db = await dbInit('edge_create_token_request', getLogger);
        app = await setupAppWithCustomConfig(
            db.stores,
            {
                edgeMasterKey,
                edgeClientSecret,
            },
            db.rawDatabase,
        );
        await app.services.edgeService.saveClient(clientId, edgeClientSecret);
    });

    test('Happy case, all headers in place and valid signature', async () => {
        const body: EdgeEnvironmentsProjectsListSchema = {
            tokens: [
                {
                    environment,
                    projects: ['*'],
                },
            ],
        };
        const headers = buildRequest({ body });
        await app.request
            .post('/edge/issue-token')
            .set('Authorization', headers.authorization)
            .set('x-timestamp', headers.timestamp)
            .set('x-nonce', headers.nonce)
            .set('content-sha256', headers.bodyHash)
            .send(body)
            .expect(200)
            .expect((res) => {
                expect(res.body.tokens).toHaveLength(1);
                expect(res.body.tokens[0].projects).toStrictEqual(['*']);
                expect(res.body.tokens[0].type).toStrictEqual(
                    ApiTokenType.BACKEND,
                );
                const token = res.body.tokens[0].token as string;
                expect(token).toMatch(/^\*:development\..*/);
            });
    });

    test('no hmac signature gets rejected', async () => {
        await app.request
            .post('/edge/issue-token')
            .send({
                tokens: [
                    {
                        environment,
                        projects: ['*'],
                    },
                ],
            })
            .expect(401)
            .expect((res) => {
                expect(res.body.error).toStrictEqual(
                    'Missing HMAC authorization header',
                );
            });
    });

    test('missing timestamp gets rejected', async () => {
        const body: EdgeEnvironmentsProjectsListSchema = {
            tokens: [
                {
                    environment,
                    projects: ['*'],
                },
            ],
        };
        const headers = buildRequest({ body });
        await app.request
            .post('/edge/issue-token')
            .set('Authorization', headers.authorization)
            .set('x-nonce', headers.nonce)
            .send(body)
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({ error: 'Missing content headers' });
            });
    });

    test('rejects multiple requests with same nonce', async () => {
        const body: EdgeEnvironmentsProjectsListSchema = {
            tokens: [
                {
                    environment: 'development',
                    projects: ['*'],
                },
            ],
        };
        const headers = buildRequest({ body });
        await app.request
            .post('/edge/issue-token')
            .set('Authorization', headers.authorization)
            .set('x-timestamp', headers.timestamp)
            .set('x-nonce', headers.nonce)
            .set('content-sha256', headers.bodyHash)
            .send(body)
            .expect(200)
            .expect((res) => {
                expect(res.body.tokens).toHaveLength(1);
                expect(res.body.tokens[0].projects).toStrictEqual(['*']);
                expect(res.body.tokens[0].type).toStrictEqual(
                    ApiTokenType.BACKEND,
                );
                const token = res.body.tokens[0].token as string;
                expect(token).toMatch(/^\*:development\..*/);
            });
        await app.request
            .post('/edge/issue-token')
            .set('Authorization', headers.authorization)
            .set('x-timestamp', headers.timestamp)
            .set('x-nonce', headers.nonce)
            .set('content-sha256', headers.bodyHash)
            .send(body)
            .expect(401)
            .expect((res) => {
                expect(res.body.error).toStrictEqual('Replay detected');
            });
    });

    test('reject requests if body is modified after signature is created', async () => {
        const signedBody: EdgeEnvironmentsProjectsListSchema = {
            tokens: [
                {
                    environment,
                    projects: ['*'],
                },
            ],
        };
        const headers = buildRequest({ body: signedBody });
        await app.request
            .post('/edge/issue-token')
            .set('Authorization', headers.authorization)
            .set('x-timestamp', headers.timestamp)
            .set('x-nonce', headers.nonce)
            .set('content-sha256', headers.bodyHash)
            .send({
                tokens: [
                    {
                        environment: 'production',
                        projects: ['*'],
                    },
                ],
            })
            .expect(401)
            .expect((res) => {
                expect(res.body.error).toStrictEqual('Body tampering detected');
            });
    });

    test('stale request gets rejected', async () => {
        const signedBody: EdgeEnvironmentsProjectsListSchema = {
            tokens: [
                {
                    environment,
                    projects: ['*'],
                },
            ],
        };
        const headers = buildRequest({
            timestamp: subMinutes(new Date(), 10),
            body: signedBody,
        });
        await app.request
            .post('/edge/issue-token')
            .set('Authorization', headers.authorization)
            .set('x-timestamp', headers.timestamp)
            .set('x-nonce', headers.nonce)
            .set('content-sha256', headers.bodyHash)
            .send({
                tokens: [
                    {
                        environment,
                        projects: ['*'],
                    },
                ],
            })
            .expect(401)
            .expect((res) => {
                expect(res.body).toStrictEqual({
                    error: 'Stale request',
                });
            });
    });

    afterAll(async () => {
        if (db) {
            await db.destroy();
        }
    });
});

type IssueTokenRequestHeaders = {
    timestamp: string;
    nonce: string;
    bodyHash: string;
    authorization: string;
};

type BuildRequestArgs = {
    timestamp?: Date | undefined;
    body: EdgeEnvironmentsProjectsListSchema;
};

const buildRequest = ({
    body,
    timestamp,
}: BuildRequestArgs): IssueTokenRequestHeaders => {
    const actualTimestamp =
        timestamp?.toISOString() ?? new Date().toISOString();
    const nonce = randomBytes(16).toString('hex');
    const bodyString = JSON.stringify(body);
    const bodyHash = createHash('sha256').update(bodyString).digest('hex');

    const canonical =
        'POST' +
        '\n' +
        '/edge/issue-token' +
        '\n' +
        actualTimestamp +
        '\n' +
        nonce +
        '\n' +
        bodyHash;
    const signature = createHmac(
        'sha256',
        Buffer.from(edgeClientSecret, 'base64url'),
    )
        .update(canonical)
        .digest('base64url');
    return {
        timestamp: actualTimestamp,
        nonce,
        bodyHash,
        authorization: `HMAC ${clientId}:${signature}`,
    };
};
