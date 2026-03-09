import express, { Router } from 'express';
import openapi from '@wesleytodd/openapi';
import {
    conditionalMiddleware,
    requireEnabledFlag,
} from '../../../../lib/middleware/conditional-middleware.js';
import supertest from 'supertest';

test('disabled middleware should not block paths that use the same path', async () => {
    const app = express();
    const path = '/api/admin/projects';

    app.use(
        path,
        conditionalMiddleware(
            () => false,
            (_req, res) => {
                res.send({ changeRequest: 'hello' });
            },
        ),
    );

    app.get(path, (_req, res) => {
        res.json({ projects: [] });
    });

    await supertest(app)
        .get('/api/admin/projects')
        .expect(200, { projects: [] });
});

test('should return 404 when path is not enabled', async () => {
    const app = express();
    const path = '/api/admin/projects';

    app.use(
        `${path}/change-requests`,
        conditionalMiddleware(
            () => false,
            (_req, res) => {
                res.send({ changeRequest: 'hello' });
            },
        ),
    );

    app.get(path, (_req, res) => {
        res.json({ projects: [] });
    });

    await supertest(app).get('/api/admin/projects/change-requests').expect(404);
});

test('should respect ordering of endpoints', async () => {
    const app = express();
    const path = '/api/admin/projects';

    app.use(
        path,
        conditionalMiddleware(
            () => true,
            (_req, res) => {
                res.json({ name: 'Request changes' });
            },
        ),
    );

    app.get(path, (_req, res) => {
        res.json({ projects: [] });
    });

    await supertest(app)
        .get('/api/admin/projects')
        .expect(200, { name: 'Request changes' });
});

test('disabled middleware should not block paths that use the same basepath', async () => {
    const app = express();
    const path = '/api/admin/projects';

    app.use(
        `${path}/change-requests`,
        conditionalMiddleware(
            () => false,
            (_req, res) => {
                res.json({ name: 'Request changes' });
            },
        ),
    );

    app.get(path, (_req, res) => {
        res.json({ projects: [] });
    });

    await supertest(app)
        .get('/api/admin/projects')
        .expect(200, { projects: [] });
});

describe('requireEnabledFlag', () => {
    const testRouter = (_req, res) => {
        res.status(201).json({ ok: true });
    };
    test('should allow request when flag is enabled', async () => {
        const app = express();
        let enabled = true;
        const config = {
            flagResolver: {
                isEnabled: () => enabled,
            },
        } as any;

        app.use(
            '/api/admin/do-the-thing',
            // @ts-expect-error - flag doesn't really exist, just want to test the gating behavior
            requireEnabledFlag(config, 'the-thing'),
            testRouter,
        );

        await supertest(app)
            .post('/api/admin/do-the-thing')
            .expect(201, { ok: true });

        enabled = false;

        await supertest(app).post('/api/admin/do-the-thing').expect(404);
    });

    test('should stop downstream middleware when flag is disabled', async () => {
        const app = express();
        const config = {
            flagResolver: {
                isEnabled: () => false,
            },
        } as any;

        app.use(
            '/api/admin/do-the-thing',
            // @ts-expect-error - flag doesn't really exist, just want to test the gating behavior
            requireEnabledFlag(config, 'the-thing'),
            testRouter,
        );

        await supertest(app).post('/api/admin/do-the-thing').expect(404);
    });

    test('should keep routes discoverable in OpenAPI when flag is disabled', async () => {
        const app = express();
        const config = {
            flagResolver: {
                isEnabled: () => false,
            },
        } as any;

        const oapi = openapi('/docs/openapi', {
            openapi: '3.0.0',
            info: {
                title: 'Test API',
                version: '1.0.0',
            },
        });

        const router = Router();
        router.post(
            '/actions',
            oapi.validPath({
                operationId: 'createSignalAction',
                summary: 'Create signal action',
                responses: {
                    201: {
                        description: 'Created',
                    },
                },
            }),
            testRouter,
        );

        app.use(
            '/api/admin/do-the-thing',
            // @ts-expect-error - flag doesn't really exist, just want to test the gating behavior
            requireEnabledFlag(config, 'the-thing'),
            router,
        );
        app.use(oapi);

        const specResponse = await supertest(app)
            .get('/docs/openapi.json')
            .expect(200);

        const hasCreateActionOperation = Object.values(
            specResponse.body.paths,
        ).some(
            (pathItem) =>
                (pathItem as { post?: { operationId?: string } })?.post
                    ?.operationId === 'createSignalAction',
        );
        expect(hasCreateActionOperation).toBe(true);

        await supertest(app)
            .post('/api/admin/do-the-thing/actions')
            .expect(404);
    });
});
