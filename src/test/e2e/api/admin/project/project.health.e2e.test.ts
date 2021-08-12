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
