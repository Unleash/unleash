import express from 'express';
import { conditionalMiddleware } from '../../../../lib/middleware/conditional-middleware';
import supertest from 'supertest';
import cors from 'cors';

test('should return 200 when middleware is disabled', async () => {
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

test('should respect priority', async () => {
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

test('should return 200 for endpoint on the same basepath if middleware is disabled', async () => {
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

test('should match path for middleware with path set to /', async () => {
    const app = express();
    const pathOne = '/api/frontend*';
    const pathTwo = '/api/frontendTwo*';

    app.options(
        pathOne,
        conditionalMiddleware(() => false, cors()),
    );

    app.options(
        '/',
        conditionalMiddleware(() => false, cors()),
    );

    await supertest(app).options(pathOne).expect(404);

    await supertest(app).options(pathTwo).expect(404);
});

test('should match path for middleware with path set to /', async () => {
    const app = express();
    const pathOne = '/api/frontend*';
    const pathTwo = '/api/frontendTwo*';

    app.options(
        pathOne,
        conditionalMiddleware(() => true, cors()),
    );

    app.options(
        '/',
        conditionalMiddleware(() => true, cors()),
    );

    await supertest(app)
        .options(pathOne)
        .expect(204)
        .expect((res) => res.headers['access-control-allow-origin'] === '*');

    await supertest(app)
        .options(pathTwo)
        .expect(204)
        .expect((res) => res.headers['access-control-allow-origin'] === '*');
});
