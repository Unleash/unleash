import { addDays } from 'date-fns';
import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import getLogger from '../../../test/fixtures/no-logger';
import { ProjectLifecycleSummaryReadModel } from './project-lifecycle-summary-read-model';

let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('project_lifecycle_summary_read_model_serial', getLogger);
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});

const updateFeatureStageDate = async (featureId, stage, newDate) => {
    await db
        .rawDatabase('feature_lifecycles')
        .where({ feature: featureId, stage: stage })
        .update({ created_at: newDate });
};

describe('Average time calculation', () => {
    test('it calculates the average time for each stage', async () => {
        const project1 = await db.stores.projectStore.create({
            name: 'project1',
            id: 'project1',
        });
        const flag1 = await db.stores.featureToggleStore.create(project1.id, {
            name: 'flag1',
            createdByUserId: 1,
        });

        const now = new Date();

        const newStage = await db.stores.featureLifecycleStore.insert([
            {
                feature: flag1.name,
                stage: 'initial',
            },
            {
                feature: flag1.name,
                stage: 'pre-live',
            },
            {
                feature: flag1.name,
                stage: 'live',
            },
            {
                feature: flag1.name,
                stage: 'completed',
            },
            {
                feature: flag1.name,
                stage: 'archived',
            },
        ]);

        // modify insertion times
        await updateFeatureStageDate(flag1.name, 'pre-live', addDays(now, 2));
        await updateFeatureStageDate(flag1.name, 'live', addDays(now, 5));
        await updateFeatureStageDate(flag1.name, 'completed', addDays(now, 6));
        await updateFeatureStageDate(flag1.name, 'archived', addDays(now, 10));

        const readModel = new ProjectLifecycleSummaryReadModel(db.rawDatabase);

        const result = await readModel.getAverageTimeInEachStage(project1.id);

        expect(result).toMatchObject({
            initial: 2,
            'pre-live': 3,
            live: 1,
            completed: 4,
        });
    });

    test("it ignores rows that don't have a next stage", async () => {});
});
