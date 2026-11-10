import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import {
    type IUnleashTest,
    setupAppWithAuth,
} from '../../../test/e2e/helpers/test-helper.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import { ApiTokenType } from '../../types/model.js';
import { DEFAULT_PROJECT } from '../../types/index.js';
import EventEmitter from 'events';
import { FEATURE_CREATED } from '../../events/index.js';
import { UserRecentFlagsReadModel } from './user-recent-flags-read-model.js';
import type { ProjectAccess } from '../private-project/privateProjectStore.js';
import { anonymise } from '../../util/index.js';

let app: IUnleashTest;
let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('user_recent_flags', getLogger);
    app = await setupAppWithAuth(
        db.stores,
        {
            experimental: {
                flags: {
                    anonymiseEventLog: true,
                },
            },
        },
        db.rawDatabase,
    );
});

afterAll(async () => {
    await app.destroy();
    await db.destroy();
});

const loginUser = async (email: string) => {
    const { body } = await app.request
        .post(`/auth/demo/login`)
        .send({ email })
        .expect(200);
    return body.id as number;
};

const getUserRecentFlags = async (query = '') => {
    const { body } = await app.request
        .get(`/api/admin/user/recent-flags${query}`)
        .expect(200);
    return body;
};

// Runs before any login, because the agent's session cookie would take precedence over the token.
test('should reject callers without a user', async () => {
    const token = await app.services.apiTokenService.createApiTokenWithProjects(
        {
            type: ApiTokenType.ADMIN,
            projects: ['*'],
            environment: '*',
            tokenName: 'admin-token',
        },
    );

    await app.request
        .get('/api/admin/user/recent-flags')
        .set('Authorization', token.secret)
        .expect(403);
});

test('should list flags the user worked on, most recent first', async () => {
    await loginUser('other@getunleash.io');
    await app.createFeature('unfavorited');
    await app.createFeature('favorited');
    await app.createFeature('enabled_by_me');

    await loginUser('me@getunleash.io');
    await app.enableFeature('favorited', 'development');
    await app.createFeature('created_by_me');
    await app.createFeature('archived_by_me');
    await app.enableFeature('enabled_by_me', 'development');
    await app.archiveFeature('archived_by_me');

    await app.favoriteFeature('favorited');
    await app.favoriteFeature('unfavorited');
    await app.request
        .delete(
            `/api/admin/projects/${DEFAULT_PROJECT}/features/unfavorited/favorites`,
        )
        .set('Content-Type', 'application/json')
        .expect(200);

    await loginUser('other@getunleash.io');
    await app.enableFeature('favorited', 'production');
    await loginUser('me@getunleash.io');

    const recentFlags = await getUserRecentFlags();
    expect(recentFlags).toMatchObject({
        flags: [
            { name: 'enabled_by_me' },
            {
                name: 'created_by_me',
                createdBy: { name: anonymise('me@getunleash.io') },
            },
            { name: 'favorited' },
        ],
        limit: 100,
        offset: 0,
    });
    const userLastUpdatedAts = recentFlags.flags.map(
        (flag: { userLastUpdatedAt: string }) => flag.userLastUpdatedAt,
    );
    const newestFirst = [...userLastUpdatedAts].sort().reverse();
    expect(userLastUpdatedAts).toEqual(newestFirst);

    expect(await getUserRecentFlags('?limit=1&offset=1')).toMatchObject({
        flags: [{ name: 'created_by_me' }],
        limit: 1,
        offset: 1,
    });
});

test('read model leaves out flags outside the given projects', async () => {
    const userId = await loginUser('project-access@getunleash.io');
    await db.stores.projectStore.create({
        id: 'inaccessible',
        name: 'inaccessible',
        description: '',
    });
    await app.createFeature('in_default');
    await db.stores.featureToggleStore.create('inaccessible', {
        name: 'in_inaccessible',
        createdByUserId: userId,
    });
    await db.stores.eventStore.store({
        type: FEATURE_CREATED,
        featureName: 'in_inaccessible',
        project: 'inaccessible',
        createdBy: 'project-access@getunleash.io',
        createdByUserId: userId,
        ip: '127.0.0.1',
    });
    const readModel = new UserRecentFlagsReadModel(
        db.rawDatabase,
        new EventEmitter(),
    );
    const getFlagNames = async (projectAccess: ProjectAccess) => {
        const flags = await readModel.getUserRecentFlags(userId, {
            limit: 100,
            offset: 0,
            projectAccess,
        });
        return flags.map((flag) => flag.name);
    };

    expect(await getFlagNames({ mode: 'all' })).toEqual([
        'in_inaccessible',
        'in_default',
    ]);
    expect(
        await getFlagNames({ mode: 'limited', projects: [DEFAULT_PROJECT] }),
    ).toEqual(['in_default']);
});
