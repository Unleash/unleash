import express from 'express';
import { conditionalMiddleware } from '../../../../lib/middleware/conditional-middleware';
import supertest from 'supertest';

test('disabled middleware should not block paths that use the same path', async () => {
    const app = express();
    const path = '/api/admin/projects';

    app.use(
        path,
        conditionalMiddleware(
            () => false,
            (req, res) => {
                res.send({ suggestChanges: 'hello' });
            },
        ),
    );

    app.get(path, (req, res) => {
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
        `${path}/suggest-changes`,
        conditionalMiddleware(
            () => false,
            (req, res) => {
                res.send({ suggestChanges: 'hello' });
            },
        ),
    );

    app.get(path, (req, res) => {
        res.json({ projects: [] });
    });

    await supertest(app).get('/api/admin/projects/suggest-changes').expect(404);
});

test('should respect ordering of endpoints', async () => {
    const app = express();
    const path = '/api/admin/projects';

    app.use(
        path,
        conditionalMiddleware(
            () => true,
            (req, res) => {
                res.json({ name: 'Suggest changes' });
            },
        ),
    );

    app.get(path, (req, res) => {
        res.json({ projects: [] });
    });

    await supertest(app)
        .get('/api/admin/projects')
        .expect(200, { name: 'Suggest changes' });
});

test('disabled middleware should not block paths that use the same basepath', async () => {
    const app = express();
    const path = '/api/admin/projects';

    app.use(
        `${path}/suggest-changes`,
        conditionalMiddleware(
            () => false,
            (req, res) => {
                res.json({ name: 'Suggest changes' });
            },
        ),
    );

    app.get(path, (req, res) => {
        res.json({ projects: [] });
    });

    await supertest(app)
        .get('/api/admin/projects')
        .expect(200, { projects: [] });
});
