import express, { Router } from 'express';
import openapi from '@wesleytodd/openapi';
import {
    conditionalMiddleware,
    requireFeatureEnabled,
} from '../../../../lib/middleware/conditional-middleware.js';
import supertest from 'supertest';

describe('requireFeatureEnabled', () => {
    test('enabled middleware should allow access to guarded route', async () => {
        const app = express();
        const path = '/api/admin/projects';
        const flagResolver = {
            isEnabled: (_name: string) => true,
        };

        app.use(
            `${path}/change-requests`,
            requireFeatureEnabled(flagResolver, 'changeRequestEnabled'),
            (_req, res) => {
                res.json({ changeRequest: 'hello' });
            },
        );

        await supertest(app)
            .get('/api/admin/projects/change-requests')
            .expect(200, { changeRequest: 'hello' });
    });

    test('should return 404 when feature is disabled', async () => {
        const app = express();
        const path = '/api/admin/projects';
        const flagResolver = {
            isEnabled: (_name: string) => false,
        };

        app.use(
            `${path}/change-requests`,
            requireFeatureEnabled(flagResolver, 'changeRequestEnabled'),
            (_req, res) => {
                res.send({ changeRequest: 'hello' });
            },
        );

        await supertest(app)
            .get('/api/admin/projects/change-requests')
            .expect(404);
    });

    test('disabled middleware should not block paths that use the same basepath', async () => {
        const app = express();
        const path = '/api/admin/projects';
        const flagResolver = {
            isEnabled: (_name: string) => false,
        };

        app.use(
            `${path}/change-requests`,
            requireFeatureEnabled(flagResolver, 'changeRequestEnabled'),
            (_req, res) => {
                res.json({ name: 'Request changes' });
            },
        );

        app.get(path, (_req, res) => {
            res.json({ projects: [] });
        });

        await supertest(app).get('/api/admin/projects').expect(200, {
            projects: [],
        });
    });

    test('should respect ordering of endpoints', async () => {
        const app = express();
        const path = '/api/admin/projects';
        const flagResolver = {
            isEnabled: (_name: string) => true,
        };

        app.use(
            path,
            requireFeatureEnabled(flagResolver, 'changeRequestEnabled'),
            (_req, res) => {
                res.json({ name: 'Request changes' });
            },
        );

        app.get(path, (_req, res) => {
            res.json({ projects: [] });
        });

        await supertest(app)
            .get('/api/admin/projects')
            .expect(200, { name: 'Request changes' });
    });
});

test('conditionalMiddleware remains compatible while deprecated', async () => {
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

    await supertest(app).get('/api/admin/projects').expect(200, {
        projects: [],
    });
});

test('routes stay discoverable in OpenAPI when guarded route returns 404', async () => {
    const app = express();
    const flagResolver = {
        isEnabled: (_name: string) => false,
    };

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
        (_req, res) => {
            res.status(201).json({ ok: true });
        },
    );

    app.use(
        '/api/admin/do-the-thing',
        requireFeatureEnabled(flagResolver, 'the-thing'),
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

    await supertest(app).post('/api/admin/do-the-thing/actions').expect(404);
});
