import express from 'express';
import supertest from 'supertest';

import { auditAccessMiddleware, extractAuditInfo } from './audit-middleware.js';
import { createTestConfig } from '../../test/config/test-config.js';
import noAuthentication from './no-authentication.js';
import type { IAuthRequest } from '../routes/unleash-types.js';
import type { IAuditUser } from '../types/index.js';

const config = createTestConfig();

const USER_AGENT = 'csoc-smoke-test/1.0';

const captureSetup = (userAgentEnabled: boolean) => {
    const app = express();
    noAuthentication('', app);
    app.use(
        '',
        auditAccessMiddleware(
            createTestConfig({
                experimental: {
                    flags: { auditEventUserAgent: userAgentEnabled },
                },
            }),
        ),
    );

    let audit: IAuditUser | undefined;
    const record = (req: IAuthRequest, res) => {
        audit = req.audit;
        res.status(200).end();
    };
    app.get('/api/admin/test', record);
    app.post('/api/admin/test', record);

    return { request: supertest(app), getAudit: () => audit };
};

describe('auditMiddleware testing', () => {
    test('Adds username and id from an IAuthRequest', async () => {
        const middleware = auditAccessMiddleware(config);
        const app = express();
        noAuthentication('', app);
        app.use('', middleware);
        let audit: IAuditUser | undefined;
        app.get('/api/admin/test', (req: IAuthRequest, res) => {
            audit = req.audit;
            res.status(200).end();
        });
        const request = supertest(app);
        await request.get('/api/admin/test').expect(200);
        expect(audit).toBeDefined();
        expect(audit!.id).toBe(-1);
        expect(audit!.username).toBe('unknown');
        expect(audit!.ip).toBe('::ffff:127.0.0.1');
    });
    test('If no auth in place, does not add the audit object', async () => {
        const middleware = auditAccessMiddleware(config);
        const app = express();
        app.use('', middleware);
        let audit: IAuditUser | undefined;
        app.get('/api/admin/test', (req: IAuthRequest, res) => {
            audit = req.audit;
            res.status(200).end();
        });
        const request = supertest(app);
        await request.get('/api/admin/test').expect(200);
        expect(audit).toBeUndefined();
    });

    test('captures the user agent while the flag is on', async () => {
        const { request, getAudit } = captureSetup(true);

        await request
            .post('/api/admin/test')
            .set('User-Agent', USER_AGENT)
            .expect(200);

        expect(getAudit()!.userAgent).toBe(USER_AGENT);
    });

    test('does not read the user agent while the flag is off', async () => {
        const { request, getAudit } = captureSetup(false);

        await request
            .post('/api/admin/test')
            .set('User-Agent', USER_AGENT)
            .expect(200);

        // off by default: header is never read, rest of the audit unaffected
        expect(getAudit()!.userAgent).toBeUndefined();
        expect(getAudit()!.ip).toBe('::ffff:127.0.0.1');
        expect(getAudit()!.username).toBe('unknown');
    });

    test('records "no user agent" when the client sends none', async () => {
        const { request, getAudit } = captureSetup(true);

        await request.post('/api/admin/test').unset('User-Agent').expect(200);

        expect(getAudit()!.userAgent).toBeUndefined();
    });

    test('bounds an oversized user agent at capture', async () => {
        const { request, getAudit } = captureSetup(true);

        await request
            .post('/api/admin/test')
            .set('User-Agent', 'a'.repeat(10_000))
            .expect(200);

        expect(getAudit()!.userAgent).toHaveLength(512);
    });

    test('skips the user-agent on GET, which never creates an audit event', async () => {
        const { request, getAudit } = captureSetup(true);

        await request
            .get('/api/admin/test')
            .set('User-Agent', USER_AGENT)
            .expect(200);

        expect(getAudit()!.userAgent).toBeUndefined();
    });

    describe('extractAuditInfo()', () => {
        const request = (userAgent?: string) =>
            ({
                ip: '127.0.0.1',
                user: { id: 1, email: 'unleashakis@yggdrasil.com' },
                get: (name: string) =>
                    name.toLowerCase() === 'user-agent' ? userAgent : undefined,
            }) as any;

        test('should carry the user-agent when asked to', () => {
            expect(
                extractAuditInfo(request('curl/8.4.0'), {
                    captureUserAgent: true,
                }),
            ).toMatchObject({ ip: '127.0.0.1', userAgent: 'curl/8.4.0' });
        });

        test('should read no user-agent when not asked to', () => {
            expect(
                extractAuditInfo(request('curl/8.4.0'), {
                    captureUserAgent: false,
                }),
            ).toMatchObject({ ip: '127.0.0.1', userAgent: undefined });
        });
    });
});
