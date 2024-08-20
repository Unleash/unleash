import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import getLogger from '../../../test/fixtures/no-logger';
import type { IFeatureToggleStore } from '../feature-toggle/types/feature-toggle-store-type';
import type {
    IEventStore,
    IFlagResolver,
    IProjectReadModel,
    IProjectStore,
} from '../../types';
import { ProjectReadModel } from './project-read-model';
import type EventEmitter from 'events';

let db: ITestDb;
let flagStore: IFeatureToggleStore;
let projectStore: IProjectStore;
let eventStore: IEventStore;
let projectReadModel: IProjectReadModel;

const alwaysOnFlagResolver = {
    isEnabled() {
        return true;
    },
} as unknown as IFlagResolver;

beforeAll(async () => {
    db = await dbInit('feature_lifecycle_read_model', getLogger);
    projectReadModel = new ProjectReadModel(
        db.rawDatabase,
        { emit: () => {} } as unknown as EventEmitter,
        alwaysOnFlagResolver,
    );
    projectStore = db.stores.projectStore;
    eventStore = db.stores.eventStore;
    flagStore = db.stores.featureToggleStore;
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});

beforeEach(async () => {
    await projectStore.deleteAll();
    await flagStore.deleteAll();
});

test("it doesn't count flags multiple times when they have multiple events associated with them", async () => {
    await projectStore.create({ id: 'a', name: 'A' });

    await flagStore.create('a', { name: 'x', createdByUserId: 1 });

    await eventStore.store({
        type: 'feature-created',
        createdBy: 'admin',
        ip: '',
        createdByUserId: 1,
        featureName: 'x',
        project: 'a',
    });
    await eventStore.store({
        type: 'feature-updated',
        createdBy: 'admin',
        ip: '',
        createdByUserId: 1,
        featureName: 'x',
        project: 'a',
    });

    const withFlags = await projectReadModel.getProjectsForAdminUi();
    expect(withFlags).toEqual(
        expect.arrayContaining([
            expect.objectContaining({ id: 'a', featureCount: 1 }),
        ]),
    );
});

test('it uses the last flag change for an flag in the project as lastUpdated', async () => {
    const projectId = 'a';
    await projectStore.create({ id: projectId, name: 'A' });
    await eventStore.store({
        type: 'project-created',
        createdBy: 'admin',
        createdByUserId: 1,
        project: projectId,
        ip: '',
    });

    const noEvents = await projectReadModel.getProjectsForAdminUi();

    expect(noEvents[0].lastUpdatedAt).toBeNull();

    await flagStore.create(projectId, { name: 'x', createdByUserId: 1 });
    await eventStore.store({
        type: 'feature-created',
        createdBy: 'admin',
        ip: '',
        createdByUserId: 1,
        featureName: 'x',
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

    await flagStore.create(projectId1, { name: 'x', createdByUserId: 1 });
    await eventStore.store({
        type: 'feature-created',
        createdBy: 'admin',
        ip: '',
        createdByUserId: 1,
        featureName: 'x',
        project: projectId2,
    });

    const withEvents = await projectReadModel.getProjectsForAdminUi();

    expect(withEvents).toEqual(
        expect.arrayContaining([
            // no events for the flag in this project (i.e. if a flag
            // has been moved from one project to the next (before the
            // moving event has been counted)). In practice, you'll
            // always get a "feature-project-change" event to count
            expect.objectContaining({ id: projectId1, lastUpdatedAt: null }),
            // this flag no longer exists in this project because it
            // has been moved, so it should not be counted
            expect.objectContaining({ id: projectId2, lastUpdatedAt: null }),
        ]),
    );
});

test('it uses the last flag metrics received for lastReportedFlagUsage', async () => {
    await projectStore.create({ id: 'a', name: 'A' });

    await flagStore.create('a', { name: 'x', createdByUserId: 1 });

    await flagStore.setLastSeen([
        { featureName: 'x', environment: 'development' },
    ]);

    const flag = await flagStore.get('x');

    const result = await projectReadModel.getProjectsForAdminUi();
    expect(result[0].lastReportedFlagUsage).toEqual(flag.lastSeenAt);
});
