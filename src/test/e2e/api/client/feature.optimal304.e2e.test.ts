import {
    type IUnleashTest,
    setupAppWithAuth,
} from '../../helpers/test-helper.js';
import dbInit, { type ITestDb } from '../../helpers/database-init.js';
import getLogger from '../../../fixtures/no-logger.js';
import { CHANGE_REQUEST_CREATED } from '../../../../lib/events/index.js';
import { CLIENT, DEFAULT_ENV } from '../../../../lib/server-impl.js';
import { ApiTokenType } from '../../../../lib/types/model.js';
import { RoleName, TEST_AUDIT_USER } from '../../../../lib/types/index.js';

const validTokens = [
    {
        tokenName: `client-dev-token`,
        permissions: [CLIENT],
        projects: ['*'],
        environment: 'development',
        type: ApiTokenType.CLIENT,
        secret: '*:development.client',
    },
    {
        tokenName: `client-dev-default-project`,
        permissions: [CLIENT],
        projects: ['default'],
        environment: 'development',
        type: ApiTokenType.CLIENT,
        secret: 'default:development.default-only',
    },
    {
        tokenName: `client-prod-token`,
        permissions: [CLIENT],
        projects: ['*'],
        environment: 'production',
        type: ApiTokenType.CLIENT,
        secret: '*:production.client',
    },
    {
        tokenName: 'all-envs-client',
        permissions: [CLIENT],
        projects: ['*'],
        environment: '*',
        type: ApiTokenType.CLIENT,
        secret: '*:*.hungry-client',
    },
];
const devTokenSecret = validTokens[0].secret;
const devDefaultProjectTokenSecret = validTokens[1].secret;
const prodTokenSecret = validTokens[2].secret;
const allEnvsTokenSecret = validTokens[3].secret;

async function setup(): Promise<{ app: IUnleashTest; db: ITestDb }> {
    const db = await dbInit(`ignored`, getLogger);

    // Create per-environment client tokens so we can request specific environment snapshots
    const app = await setupAppWithAuth(
        db.stores,
        {
            authentication: {
                enableApiToken: true,
                initApiTokens: validTokens,
            },
            experimental: {
                flags: {
                    strictSchemaValidation: true,
                },
            },
        },
        db.rawDatabase,
    );

    return { app, db };
}

async function initialize({ app, db }: { app: IUnleashTest; db: ITestDb }) {
    const allEnvs = await app.services.environmentService.getAll();
    const nonDefaultEnv = allEnvs.find((env) => env.name !== DEFAULT_ENV)!.name;

    await app.createFeature('X');
    await app.createFeature('Y');
    await app.archiveFeature('Y');
    await app.createFeature('Z');
    await app.enableFeature('Z', DEFAULT_ENV);
    await app.enableFeature('Z', nonDefaultEnv);

    await app.services.eventService.storeEvent({
        type: CHANGE_REQUEST_CREATED,
        createdBy: 'some@example.com',
        createdByUserId: 123,
        ip: '127.0.0.1',
        featureName: `X`,
    });
}

describe('feature 304 api client', () => {
    let app: IUnleashTest;
    let db: ITestDb;
    beforeAll(async () => {
        ({ app, db } = await setup());
        await initialize({ app, db });
    });

    afterAll(async () => {
        await app.destroy();
        await db.destroy();
    });

    test('returns etag and echoes it in meta (dev env token)', async () => {
        const res = await app.request
            .get('/api/client/features')
            .set('Authorization', devTokenSecret)
            .expect('Content-Type', /json/)
            .expect(200);

        expect(res.headers.etag).toBeDefined();
        expect(res.body.meta.etag).toBe(res.headers.etag);
    });

    test(`returns 304 when client presents current etag (dev env token)`, async () => {
        const initial = await app.request
            .get('/api/client/features')
            .set('Authorization', devTokenSecret)
            .expect(200);

        const initialEtag = initial.headers.etag;

        await app.request
            .get('/api/client/features')
            .set('Authorization', devTokenSecret)
            .set('if-none-match', initialEtag)
            .expect(304);
    });

    test('creating a new feature modifies etag', async () => {
        const baseline = await app.request
            .get('/api/client/features')
            .set('Authorization', devTokenSecret)
            .expect(200);
        const oldEtag = baseline.headers.etag;

        await app.createFeature('new');
        await app.services.configurationRevisionService.updateMaxRevisionId();
        const res = await app.request
            .get('/api/client/features')
            .set('Authorization', devTokenSecret)
            .set('if-none-match', `${oldEtag}`)
            .expect(200);

        expect(res.headers.etag).not.toBe(oldEtag);
        expect(res.body.meta.etag).not.toBe(oldEtag);
        expect(res.body.features.map((f: any) => f.name)).toContain('new');
    });

    test('all-env token has its own etag and caches correctly', async () => {
        const prod = await app.request
            .get('/api/client/features')
            .set('Authorization', prodTokenSecret)
            .expect(200);
        const dev = await app.request
            .get('/api/client/features')
            .set('Authorization', devTokenSecret)
            .expect(200);
        const allEnvs = await app.request
            .get('/api/client/features')
            .set('Authorization', allEnvsTokenSecret)
            .expect(200);

        expect(allEnvs.body.meta.etag).toBe(allEnvs.headers.etag);
        expect(allEnvs.headers.etag).not.toBe(prod.headers.etag);
        expect(allEnvs.headers.etag).not.toBe(dev.headers.etag);

        await app.request
            .get('/api/client/features')
            .set('Authorization', allEnvsTokenSecret)
            .set('if-none-match', allEnvs.headers.etag)
            .expect(304);
    });

    test('production environment gets a different etag than development', async () => {
        const prod = await app.request
            .get('/api/client/features?bla=1')
            .set('Authorization', prodTokenSecret)
            .expect(200);

        const dev = await app.request
            .get('/api/client/features')
            .set('Authorization', devTokenSecret)
            .expect(200);

        expect(prod.body.meta.etag).toBe(prod.headers.etag);
        expect(dev.body.meta.etag).toBe(dev.headers.etag);
        expect(prod.headers.etag).not.toBe(dev.headers.etag);
    });

    test('modifying dev environment should only invalidate dev tokens', async () => {
        const prodBaseline = await app.request
            .get('/api/client/features')
            .set('Authorization', prodTokenSecret)
            .expect(200);
        const devBaseline = await app.request
            .get('/api/client/features')
            .set('Authorization', devTokenSecret)
            .expect(200);

        await app.request
            .get('/api/client/features')
            .set('if-none-match', prodBaseline.headers.etag)
            .set('Authorization', prodTokenSecret)
            .expect(304);

        await app.request
            .get('/api/client/features')
            .set('Authorization', devTokenSecret)
            .set('if-none-match', devBaseline.headers.etag)
            .expect(304);

        await app.enableFeature('X', DEFAULT_ENV);
        await app.services.configurationRevisionService.updateMaxRevisionId();

        await app.request
            .get('/api/client/features')
            .set('Authorization', prodTokenSecret)
            .set('if-none-match', prodBaseline.headers.etag)
            .expect(304);

        const { headers: devHeaders } = await app.request
            .get('/api/client/features')
            .set('Authorization', devTokenSecret)
            .set('if-none-match', devBaseline.headers.etag)
            .expect(200);

        expect(devHeaders.etag).not.toBe(devBaseline.headers.etag);
    });

    test('archiving a feature removes it from client response and updates etag', async () => {
        const featureName = 'temp-archive';
        await app.createFeature(featureName);
        await app.enableFeature(featureName, DEFAULT_ENV);
        await app.services.configurationRevisionService.updateMaxRevisionId();

        const first = await app.request
            .get('/api/client/features')
            .set('Authorization', devTokenSecret)
            .expect(200);

        const firstEtag = first.headers.etag;
        expect(first.body.features.map((f: any) => f.name)).toContain(
            featureName,
        );

        await app.archiveFeature(featureName);
        await app.services.configurationRevisionService.updateMaxRevisionId();

        const second = await app.request
            .get('/api/client/features')
            .set('Authorization', devTokenSecret)
            .set('if-none-match', firstEtag)
            .expect(200);

        expect(second.headers.etag).not.toBe(firstEtag);
        expect(second.body.features.map((f: any) => f.name)).not.toContain(
            featureName,
        );
    });

    test('deleting an archived feature updates etag', async () => {
        const featureName = 'temp-delete';
        await app.createFeature(featureName);
        await app.enableFeature(featureName, DEFAULT_ENV);
        await app.services.configurationRevisionService.updateMaxRevisionId();

        const initial = await app.request
            .get('/api/client/features')
            .set('Authorization', devTokenSecret)
            .expect(200);

        const initialEtag = initial.headers.etag;
        expect(initial.body.features.map((f: any) => f.name)).toContain(
            featureName,
        );

        await app.archiveFeature(featureName);
        await app.services.configurationRevisionService.updateMaxRevisionId();

        const afterArchive = await app.request
            .get('/api/client/features')
            .set('Authorization', devTokenSecret)
            .set('if-none-match', initialEtag)
            .expect(200);

        const archiveEtag = afterArchive.headers.etag;
        expect(archiveEtag).not.toBe(initialEtag);
        expect(
            afterArchive.body.features.map((f: any) => f.name),
        ).not.toContain(featureName);

        await app.request
            .delete(`/api/admin/archive/${featureName}`)
            .expect(200);
        await app.services.configurationRevisionService.updateMaxRevisionId();

        const afterDelete = await app.request
            .get('/api/client/features')
            .set('Authorization', devTokenSecret)
            .set('if-none-match', archiveEtag)
            .expect(200);

        expect(afterDelete.headers.etag).not.toBe(archiveEtag);
        expect(afterDelete.body.meta.etag).toBe(afterDelete.headers.etag);
        expect(afterDelete.body.features.map((f: any) => f.name)).not.toContain(
            featureName,
        );
    });

    test('moving a feature to another project updates project field and etag', async () => {
        const featureName = 'temp-move';
        const targetProject = 'second-project';

        // ensure target project exists
        const adminUser = await app.services.userService.createUser(
            {
                name: 'Move Admin',
                email: 'move-admin@getunleash.io',
                rootRole: RoleName.ADMIN,
            },
            TEST_AUDIT_USER,
        );
        await app.services.projectService.createProject(
            { id: targetProject, name: targetProject, mode: 'open' },
            adminUser,
            TEST_AUDIT_USER,
        );

        await app.createFeature(featureName);
        await app.enableFeature(featureName, DEFAULT_ENV);
        await app.services.configurationRevisionService.updateMaxRevisionId();

        const initial = await app.request
            .get('/api/client/features')
            .set('Authorization', devDefaultProjectTokenSecret)
            .expect(200);

        const initialEtag = initial.headers.etag;
        const initialProject = initial.body.features.find(
            (f: any) => f.name === featureName,
        )?.project;
        expect(initialProject).toBe('default');

        await app.services.featureToggleService.changeProject(
            featureName,
            targetProject,
            TEST_AUDIT_USER,
        );
        await app.services.configurationRevisionService.updateMaxRevisionId();

        const afterMove = await app.request
            .get('/api/client/features')
            .set('Authorization', devDefaultProjectTokenSecret)
            .set('if-none-match', initialEtag)
            .expect(200);

        expect(afterMove.headers.etag).not.toBe(initialEtag);
        const movedFeature = afterMove.body.features.find(
            (f: any) => f.name === featureName,
        );
        expect(movedFeature).toBeUndefined();
    });
});
