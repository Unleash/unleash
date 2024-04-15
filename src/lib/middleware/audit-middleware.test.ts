import { auditAccessMiddleware } from './audit-middleware';
import { createTestConfig } from '../../test/config/test-config';
import express from 'express';
import noAuthentication from './no-authentication';
import type { IAuthRequest } from '../routes/unleash-types';
import type { IAuditUser } from '../types';
import supertest from 'supertest';

const config = createTestConfig();

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
});
