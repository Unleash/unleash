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

test('it gets the right number of flags for a project', async () => {
    await projectStore.create({ id: 'a', name: 'A' });
    await projectStore.create({ id: 'b', name: 'B' });

    const noFlags = await projectReadModel.getProjectsForAdminUi();
    expect(noFlags).toEqual(
        expect.arrayContaining([
            expect.objectContaining({ id: 'a', featureCount: 0 }),
            expect.objectContaining({ id: 'b', featureCount: 0 }),
        ]),
    );

    await flagStore.create('a', { name: 'x', createdByUserId: 1 });
    await flagStore.create('a', { name: 'y', createdByUserId: 1 });
    await flagStore.create('b', { name: 'z', createdByUserId: 1 });

    const withFlags = await projectReadModel.getProjectsForAdminUi();
    expect(withFlags).toEqual(
        expect.arrayContaining([
            expect.objectContaining({ id: 'a', featureCount: 2 }),
            expect.objectContaining({ id: 'b', featureCount: 1 }),
        ]),
    );
});

test('it gets the right number of flags for a project 2', async () => {
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

test('it uses the last flag change for an flag in the project as lastUpdated', async () => {});
test('it uses the last flag metrics received for lastReportedFlagUsage', async () => {});
