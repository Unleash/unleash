import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import { ProjectHealthFeaturesReadModel } from './features-read-model.js';

let db: ITestDb;
let readModel: ProjectHealthFeaturesReadModel;

beforeAll(async () => {
    db = await dbInit('project_health_feature_read_model_serial', getLogger);
    readModel = new ProjectHealthFeaturesReadModel(db.rawDatabase);

    await db.stores.projectStore.create({
        id: 'other-project',
        name: 'Other Project',
        description: '',
    });
});

afterAll(async () => {
    await db.destroy();
});

const createFlag = async ({
    name,
    project = 'default',
    potentiallyStale = false,
    stale = false,
    archived = false,
}: {
    name: string;
    project?: string;
    potentiallyStale?: boolean;
    stale?: boolean;
    archived?: boolean;
}) => {
    await db.stores.featureToggleStore.create(project, {
        name,
        createdByUserId: 9999,
    });
    await db
        .rawDatabase('features')
        .update({ potentially_stale: potentiallyStale, stale })
        .where({ name });
    if (archived) {
        await db.stores.featureToggleStore.archive(name);
    }
};

test('counts potentially stale flags in the project that are neither stale nor archived', async () => {
    await createFlag({ name: 'fresh' });
    await createFlag({ name: 'potentially-stale-a', potentiallyStale: true });
    await createFlag({ name: 'potentially-stale-b', potentiallyStale: true });
    await createFlag({
        name: 'potentially-stale-and-stale',
        potentiallyStale: true,
        stale: true,
    });
    await createFlag({
        name: 'potentially-stale-archived',
        potentiallyStale: true,
        archived: true,
    });
    await createFlag({
        name: 'potentially-stale-elsewhere',
        project: 'other-project',
        potentiallyStale: true,
    });

    expect(await readModel.getPotentiallyStaleCount('default')).toBe(2);
    expect(await readModel.getPotentiallyStaleCount('other-project')).toBe(1);
    expect(await readModel.getPotentiallyStaleCount('no-such-project')).toBe(0);
});
