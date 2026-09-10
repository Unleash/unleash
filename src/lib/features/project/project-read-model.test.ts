import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import type { IFeatureToggleStore } from '../feature-toggle/types/feature-toggle-store-type.js';
import type {
    IAccessStore,
    IEventStore,
    IFavoriteProjectsStore,
    ILastSeenStore,
    IProjectReadModel,
    IProjectStore,
    IUserStore,
} from '../../types/index.js';
import { ProjectReadModel } from './project-read-model.js';
import type EventEmitter from 'events';

let db: ITestDb;
let flagStore: IFeatureToggleStore;
let projectStore: IProjectStore;
let eventStore: IEventStore;
let projectReadModel: IProjectReadModel;
let lastSeenStore: ILastSeenStore;
let accessStore: IAccessStore;
let favoriteProjectsStore: IFavoriteProjectsStore;
let userStore: IUserStore;

const memberRoleId = 5;

const fakeEventBus = { emit: () => {} } as unknown as EventEmitter;

const buildProjectReadModel = ({ isOss }: { isOss: boolean }) =>
    new ProjectReadModel(db.rawDatabase, { eventBus: fakeEventBus, isOss });

beforeAll(async () => {
    db = await dbInit('feature_lifecycle_read_model', getLogger);
    projectReadModel = buildProjectReadModel({ isOss: false });
    projectStore = db.stores.projectStore;
    eventStore = db.stores.eventStore;
    flagStore = db.stores.featureToggleStore;
    lastSeenStore = db.stores.lastSeenStore;
    accessStore = db.stores.accessStore;
    favoriteProjectsStore = db.stores.favoriteProjectsStore;
    userStore = db.stores.userStore;
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});

beforeEach(async () => {
    await projectStore.deleteAll();
    await flagStore.deleteAll();
    await eventStore.deleteAll();
});

test("it doesn't count flags multiple times when they have multiple events associated with them", async () => {
    const projectId = 'project';
    const flagName = 'flag';
    await projectStore.create({ id: projectId, name: projectId });

    await flagStore.create(projectId, { name: flagName, createdByUserId: 1 });

    await eventStore.store({
        type: 'feature-created',
        createdBy: 'admin',
        ip: '',
        createdByUserId: 1,
        featureName: flagName,
        project: projectId,
    });
    await eventStore.store({
        type: 'feature-updated',
        createdBy: 'admin',
        ip: '',
        createdByUserId: 1,
        featureName: flagName,
        project: projectId,
    });

    const withFlags = await projectReadModel.getProjectsForAdminUi();
    expect(withFlags).toMatchObject([{ id: projectId, featureCount: 1 }]);

    const insightsQuery = await projectReadModel.getProjectsForInsights();
    expect(insightsQuery).toMatchObject([{ id: projectId, featureCount: 1 }]);
});

test('it uses the last flag change for an flag in the project as lastUpdated', async () => {
    const projectId = 'project';
    const flagName = 'flag';
    await projectStore.create({ id: projectId, name: projectId });
    await eventStore.store({
        type: 'project-created',
        createdBy: 'admin',
        createdByUserId: 1,
        project: projectId,
        ip: '',
    });

    const noEvents = await projectReadModel.getProjectsForAdminUi();

    expect(noEvents[0].lastUpdatedAt).toBeNull();

    await flagStore.create(projectId, { name: flagName, createdByUserId: 1 });
    await eventStore.store({
        type: 'feature-created',
        createdBy: 'admin',
        ip: '',
        createdByUserId: 1,
        featureName: flagName,
        project: projectId,
    });

    const withEvents = await projectReadModel.getProjectsForAdminUi();
    expect(withEvents[0].lastUpdatedAt).not.toBeNull();
});

test('it does not consider flag events in a different project for lastUpdatedAt, and does not count flags belonging to a different project', async () => {
    const projectId1 = 'project1';
    await projectStore.create({ id: projectId1, name: 'Project1' });

    const projectId2 = 'project2';
    await projectStore.create({ id: projectId2, name: 'Project2' });

    const flagName = 'flag';
    await flagStore.create(projectId1, { name: flagName, createdByUserId: 1 });
    await eventStore.store({
        type: 'feature-created',
        createdBy: 'admin',
        ip: '',
        createdByUserId: 1,
        featureName: flagName,
        project: projectId2,
    });

    const withEvents = await projectReadModel.getProjectsForAdminUi();

    expect(withEvents).toMatchObject([
        // no events for the flag in this project (i.e. if a flag
        // has been moved from one project to the next (before the
        // moving event has been counted)). In practice, you'll
        // always get a "feature-project-change" event to count
        { id: projectId1, lastUpdatedAt: null },
        // this flag no longer exists in this project because it
        // has been moved, so it should not be counted
        { id: projectId2, lastUpdatedAt: null },
    ]);
});

test('it uses the last flag metrics received for lastReportedFlagUsage', async () => {
    const projectId = 'project';
    const flagName = 'flag';
    await projectStore.create({ id: projectId, name: projectId });

    const noUsage = await projectReadModel.getProjectsForAdminUi();
    expect(noUsage[0].lastReportedFlagUsage).toBeNull();

    await flagStore.create(projectId, { name: flagName, createdByUserId: 1 });

    await lastSeenStore.setLastSeen([
        { featureName: flagName, environment: 'development' },
    ]);

    const result = await projectReadModel.getProjectsForAdminUi();
    expect(result[0].lastReportedFlagUsage).not.toBeNull();
});

test("it only returns the default project among a user's projects in OSS", async () => {
    await projectStore.create({ id: 'default', name: 'Default' });
    await projectStore.create({ id: 'enterprise', name: 'Enterprise' });
    const user = await userStore.insert({ email: 'member@getunleash.io' });
    await accessStore.addUserToRole(user.id, memberRoleId, 'default');
    await accessStore.addUserToRole(user.id, memberRoleId, 'enterprise');

    const projects = await projectReadModel.getProjectsByUser(user.id);
    const ossProjects = await buildProjectReadModel({
        isOss: true,
    }).getProjectsByUser(user.id);

    expect(projects.toSorted()).toEqual(['default', 'enterprise']);
    expect(ossProjects).toEqual(['default']);
});

test("it only returns the default project among a user's favorites in OSS", async () => {
    await projectStore.create({ id: 'default', name: 'Default' });
    await projectStore.create({ id: 'enterprise', name: 'Enterprise' });
    const user = await userStore.insert({ email: 'favoriter@getunleash.io' });
    await favoriteProjectsStore.addFavoriteProject({
        userId: user.id,
        project: 'default',
    });
    await favoriteProjectsStore.addFavoriteProject({
        userId: user.id,
        project: 'enterprise',
    });

    const favorites = await projectReadModel.getProjectsFavoritedByUser(
        user.id,
    );
    const ossFavorites = await buildProjectReadModel({
        isOss: true,
    }).getProjectsFavoritedByUser(user.id);

    expect(favorites.toSorted()).toEqual(['default', 'enterprise']);
    expect(ossFavorites).toEqual(['default']);
});
