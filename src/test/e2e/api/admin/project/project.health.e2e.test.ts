import dbInit from '../../../helpers/database-init';
import { setupApp } from '../../../helpers/test-helper';
import getLogger from '../../../../fixtures/no-logger';

let app;
let db;
let user;

beforeAll(async () => {
    db = await dbInit('project_health_api_serial', getLogger);
    app = await setupApp(db.stores);
    user = await db.stores.userStore.insert({
        name: 'Some Name',
        email: 'test@getunleash.io',
    });
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

test('Project with no stale toggles should have 100% health rating', async () => {
    const project = {
        id: 'fresh',
        name: 'Health rating',
        description: 'Fancy',
    };
    await app.services.projectService.createProject(project, user);
    await app.request
        .post('/api/admin/projects/fresh/features')
        .send({
            name: 'health-rating-not-stale',
            description: 'new',
            stale: false,
        })
        .expect(201);
    await app.request
        .post('/api/admin/projects/fresh/features')
        .send({
            name: 'health-rating-not-stale-2',
            description: 'new too',
            stale: false,
        })
        .expect(201);
    await app.request
        .get('/api/admin/projects/fresh')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
            expect(res.body.health).toBe(100);
            expect(res.body.environments).toHaveLength(1);
            expect(res.body.environments).toStrictEqual(['default']);
        });
});

test('Health rating endpoint yields stale, potentially stale and active count on top of health', async () => {
    const project = {
        id: 'test-health',
        name: 'Health rating',
        description: 'Fancy',
    };
    await app.services.projectService.createProject(project, user);
    await app.request
        .post(`/api/admin/projects/${project.id}/features`)
        .send({
            name: 'health-report-new',
            description: 'new',
            stale: false,
        })
        .expect(201);
    await app.request
        .post(`/api/admin/projects/${project.id}/features`)
        .send({
            name: 'health-report-new-2',
            description: 'new too',
            stale: false,
        })
        .expect(201);
    await app.request
        .post(`/api/admin/projects/${project.id}/features`)
        .send({
            name: 'health-report-stale',
            description: 'new too',
            stale: true,
        })
        .expect(201);
    await app.services.projectHealthService.setHealthRating();
    await app.request
        .get(`/api/admin/projects/${project.id}/health-report`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
            expect(res.body.health).toBe(67);
            expect(res.body.activeCount).toBe(2);
            expect(res.body.staleCount).toBe(1);
            expect(res.body.potentiallyStaleCount).toBe(0);
        });
});
test('Health rating endpoint does not include archived toggles when calculating potentially stale toggles', async () => {
    const project = {
        id: 'potentially-stale-archived',
        name: 'Health rating',
        description: 'Fancy',
    };
    await app.services.projectService.createProject(project, user);
    await app.request
        .post(`/api/admin/projects/${project.id}/features`)
        .send({
            name: 'potentially-stale-archive-fresh',
            description: 'new',
            stale: false,
        })
        .expect(201);
    await app.request
        .post(`/api/admin/projects/${project.id}/features`)
        .send({
            name: 'potentially-stale-archive-fresh-2',
            description: 'new too',
            stale: false,
        })
        .expect(201);
    await app.request
        .post(`/api/admin/projects/${project.id}/features`)
        .send({
            name: 'potentially-stale-archive-stale',
            description: 'stale',
            stale: true,
        })
        .expect(201);
    await app.request
        .post(`/api/admin/projects/${project.id}/features`)
        .send({
            name: 'potentially-archive-stale',
            description: 'Really Old',
            createdAt: new Date(2019, 5, 1),
        })
        .expect(201);
    await app.request
        .post(`/api/admin/projects/${project.id}/features`)
        .send({
            name: 'potentially-archive-stale-archived',
            description: 'Really Old',
            createdAt: new Date(2019, 5, 1),
            archived: true,
        })
        .expect(201);

    await app.services.projectHealthService.setHealthRating();
    await app.request
        .get(`/api/admin/projects/${project.id}/health-report`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
            expect(res.body.health).toBe(50);
            expect(res.body.activeCount).toBe(3);
            expect(res.body.staleCount).toBe(1);
            expect(res.body.potentiallyStaleCount).toBe(1);
        });
});
test('Health rating endpoint correctly handles potentially stale toggles', async () => {
    const project = {
        id: 'potentially-stale',
        name: 'Health rating',
        description: 'Fancy',
    };
    await app.services.projectService.createProject(project, user);
    await app.request
        .post(`/api/admin/projects/${project.id}/features`)
        .send({
            name: 'potentially-stale-fresh',
            description: 'new',
            stale: false,
        })
        .expect(201);
    await app.request
        .post(`/api/admin/projects/${project.id}/features`)
        .send({
            name: 'potentially-stale-fresh-2',
            description: 'new too',
            stale: false,
        })
        .expect(201);
    await app.request
        .post(`/api/admin/projects/${project.id}/features`)
        .send({
            name: 'potentially-stale-stale',
            description: 'stale',
            stale: true,
        })
        .expect(201);
    await app.request
        .post(`/api/admin/projects/${project.id}/features`)
        .send({
            name: 'potentially-stale',
            description: 'Really Old',
            createdAt: new Date(2019, 5, 1),
        })
        .expect(201);
    await app.services.projectHealthService.setHealthRating();
    await app.request
        .get(`/api/admin/projects/${project.id}/health-report`)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
            expect(res.body.health).toBe(50);
            expect(res.body.activeCount).toBe(3);
            expect(res.body.staleCount).toBe(1);
            expect(res.body.potentiallyStaleCount).toBe(1);
        });
});

test('Health report for non-existing project yields 404', async () => {
    await app.request
        .get('/api/admin/projects/some-crazy-project-name/health-report')
        .expect(404);
});

test('Sorts environments by sort order', async () => {
    const envOne = 'my-sorted-env1';
    const envTwo = 'my-sorted-env2';
    const featureName = 'My-new-toggle';
    const defaultEnvName = 'default';
    await db.stores.environmentStore.create({
        name: envOne,
        type: 'production',
        sortOrder: 0,
    });

    await db.stores.environmentStore.create({
        name: envTwo,
        type: 'production',
        sortOrder: 500,
    });

    await app.request
        .post('/api/admin/projects/default/environments')
        .send({
            environment: envOne,
        })
        .expect(200);

    await app.request
        .post('/api/admin/projects/default/environments')
        .send({
            environment: envTwo,
        })
        .expect(200);

    await app.request
        .post('/api/admin/projects/default/features')
        .send({ name: featureName })
        .expect(201);

    await app.request.get('/api/admin/projects/default').expect((res) => {
        const feature = res.body.features[0];
        expect(feature.environments[0].name).toBe(envOne);
        expect(feature.environments[1].name).toBe(defaultEnvName);
        expect(feature.environments[2].name).toBe(envTwo);
    });
});

test('Sorts environments correctly if sort order is equal', async () => {
    const envOne = 'my-sorted-env3';
    const envTwo = 'my-sorted-env4';
    const featureName = 'My-new-toggle-2';

    await db.stores.environmentStore.create({
        name: envOne,
        type: 'production',
        sortOrder: -5,
    });

    await db.stores.environmentStore.create({
        name: envTwo,
        type: 'production',
        sortOrder: -5,
    });

    await app.request
        .post('/api/admin/projects/default/environments')
        .send({
            environment: envOne,
        })
        .expect(200);

    await app.request
        .post('/api/admin/projects/default/environments')
        .send({
            environment: envTwo,
        })
        .expect(200);

    await app.request
        .post('/api/admin/projects/default/features')
        .send({ name: featureName })
        .expect(201);

    await app.request.get('/api/admin/projects/default').expect((res) => {
        const feature = res.body.features[0];
        expect(feature.environments[0].name).toBe(envOne);
        expect(feature.environments[1].name).toBe(envTwo);
    });
});

test('Update update_at when setHealth runs', async () => {
    await app.services.projectHealthService.setHealthRating();
    await app.request
        .get('/api/admin/projects/default/health-report')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
            let now = new Date().getTime();
            let updatedAt = new Date(res.body.updatedAt).getTime();
            expect(now - updatedAt).toBeLessThan(5000);
        });
});
