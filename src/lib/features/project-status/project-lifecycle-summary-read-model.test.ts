import { addDays } from 'date-fns';
import dbInit, { type ITestDb } from '../../../test/e2e/helpers/database-init';
import getLogger from '../../../test/fixtures/no-logger';
import { ProjectLifecycleSummaryReadModel } from './project-lifecycle-summary-read-model';
import type { StageName } from '../../types';
import { randomId } from '../../util';

let db: ITestDb;

beforeAll(async () => {
    db = await dbInit('project_lifecycle_summary_read_model_serial', getLogger);
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});

afterEach(async () => {
    await db.stores.projectStore.deleteAll();
    await db.stores.featureToggleStore.deleteAll();
    await db.stores.featureLifecycleStore.deleteAll();
});

const updateFeatureStageDate = async (
    flagName: string,
    stage: string,
    newDate: Date,
) => {
    await db
        .rawDatabase('feature_lifecycles')
        .where({ feature: flagName, stage: stage })
        .update({ created_at: newDate });
};

describe('Average time calculation', () => {
    test('it calculates the average time for each stage', async () => {
        const project1 = await db.stores.projectStore.create({
            name: 'project1',
            id: 'project1',
        });
        const now = new Date();

        const flags = [
            { name: randomId(), offsets: [2, 5, 6, 10] },
            { name: randomId(), offsets: [1, null, 4, 7] },
            { name: randomId(), offsets: [12, 25, 8, 9] },
            { name: randomId(), offsets: [1, 2, 3, null] },
        ];

        for (const { name, offsets } of flags) {
            const created = await db.stores.featureToggleStore.create(
                project1.id,
                {
                    name,
                    createdByUserId: 1,
                },
            );
            await db.stores.featureLifecycleStore.insert([
                {
                    feature: name,
                    stage: 'initial',
                },
            ]);

            const stages = ['pre-live', 'live', 'completed', 'archived'];
            for (const [index, stage] of stages.entries()) {
                const offset = offsets[index];
                if (offset === null) {
                    continue;
                }

                const offsetFromInitial = offsets
                    .slice(0, index + 1)
                    .reduce((a, b) => (a ?? 0) + (b ?? 0), 0) as number;

                await db.stores.featureLifecycleStore.insert([
                    {
                        feature: created.name,
                        stage: stage as StageName,
                    },
                ]);

                await updateFeatureStageDate(
                    created.name,
                    stage,
                    addDays(now, offsetFromInitial),
                );
            }
        }

        const readModel = new ProjectLifecycleSummaryReadModel(db.rawDatabase);

        const result = await readModel.getAverageTimeInEachStage(project1.id);

        expect(result).toMatchObject({
            initial: 4, // (2 + 1 + 12 + 1) / 4 = 4
            'pre-live': 9, // (5 + 25 + 2 + 4) / 4 = 9
            live: 6, // (6 + 8 + 3) / 3 ~= 5.67 ~= 6
            completed: 9, // (10 + 7 + 9) / 3 ~= 8.67 ~= 9
        });
    });

    test('it returns `null` if it has no data for something', async () => {
        const project = await db.stores.projectStore.create({
            name: 'project',
            id: randomId(),
        });
        const readModel = new ProjectLifecycleSummaryReadModel(db.rawDatabase);

        const result1 = await readModel.getAverageTimeInEachStage(project.id);

        expect(result1).toMatchObject({
            initial: null,
            'pre-live': null,
            live: null,
            completed: null,
        });

        const flag = await db.stores.featureToggleStore.create(project.id, {
            name: randomId(),
            createdByUserId: 1,
        });
        await db.stores.featureLifecycleStore.insert([
            {
                feature: flag.name,
                stage: 'initial',
            },
        ]);

        await db.stores.featureLifecycleStore.insert([
            {
                feature: flag.name,
                stage: 'pre-live',
            },
        ]);

        await updateFeatureStageDate(
            flag.name,
            'pre-live',
            addDays(new Date(), 5),
        );

        const result2 = await readModel.getAverageTimeInEachStage(project.id);

        expect(result2).toMatchObject({
            initial: 5,
            'pre-live': null,
            live: null,
            completed: null,
        });
    });

    test('it ignores flags in other projects', async () => {
        const project = await db.stores.projectStore.create({
            name: 'project',
            id: randomId(),
        });
        const readModel = new ProjectLifecycleSummaryReadModel(db.rawDatabase);

        const flag = await db.stores.featureToggleStore.create(project.id, {
            name: randomId(),
            createdByUserId: 1,
        });
        await db.stores.featureLifecycleStore.insert([
            {
                feature: flag.name,
                stage: 'initial',
            },
        ]);

        await db.stores.featureLifecycleStore.insert([
            {
                feature: flag.name,
                stage: 'pre-live',
            },
        ]);

        await updateFeatureStageDate(
            flag.name,
            'pre-live',
            addDays(new Date(), 5),
        );

        const result =
            await readModel.getAverageTimeInEachStage('some-other-project');

        expect(result).toMatchObject({
            initial: null,
            'pre-live': null,
            live: null,
            completed: null,
        });
    });
});
