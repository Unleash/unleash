import { addDays, addMinutes } from 'date-fns';
import dbInit, {
    type ITestDb,
} from '../../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../../test/fixtures/no-logger.js';
import { ProjectLifecycleSummaryReadModel } from './project-lifecycle-summary-read-model.js';
import type { StageName } from '../../../types/index.js';
import { randomId } from '../../../util/index.js';

let db: ITestDb;
let readModel: ProjectLifecycleSummaryReadModel;

beforeAll(async () => {
    db = await dbInit('project_lifecycle_summary_read_model_serial', getLogger);
    readModel = new ProjectLifecycleSummaryReadModel(
        db.rawDatabase,
        db.stores.featureToggleStore,
    );
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
        const project = await db.stores.projectStore.create({
            name: 'project',
            id: randomId(),
        });
        const now = new Date();

        const flags = [
            { name: randomId(), offsets: [2, 5, 6, 10] },
            { name: randomId(), offsets: [1, null, 4, 7] },
            { name: randomId(), offsets: [12, 25, 0, 9] },
            { name: randomId(), offsets: [1, 2, 3, null] },
        ];

        for (const { name, offsets } of flags) {
            const created = await db.stores.featureToggleStore.create(
                project.id,
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
                    addMinutes(
                        addDays(now, offsetFromInitial),
                        1 * (index + 1),
                    ),
                );
            }
        }

        const result = await readModel.getAverageTimeInEachStage(project.id);

        expect(result).toMatchObject({
            initial: 4, // (2 + 1 + 12 + 1) / 4 = 4
            'pre-live': 9, // (5 + 4 + 25 + 2) / 4 = 9
            live: 3, // (6 + 0 + 3) / 3 = 3
            completed: 9, // (10 + 7 + 9) / 3 ~= 8.67 ~= 9
        });
    });

    test('it returns `null` if it has no data for something', async () => {
        const project = await db.stores.projectStore.create({
            name: 'project',
            id: randomId(),
        });

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

describe('count current flags in each stage', () => {
    test('it counts the number of flags in each stage for the given project', async () => {
        const project = await db.stores.projectStore.create({
            name: 'project',
            id: randomId(),
        });

        const flags = [
            {
                name: randomId(),
                stages: ['initial', 'live'],
            },
            {
                name: randomId(),
                stages: ['initial'],
            },
            {
                name: randomId(),
                stages: ['initial', 'pre-live', 'live', 'completed'],
            },
            { name: randomId(), stages: ['initial', 'pre-live', 'live'] },
        ];

        for (const { name, stages } of flags) {
            const flag = await db.stores.featureToggleStore.create(project.id, {
                name,
                createdByUserId: 1,
            });

            const time = Date.now();
            for (const [index, stage] of stages.entries()) {
                await db.stores.featureLifecycleStore.insert([
                    {
                        feature: flag.name,
                        stage: stage as StageName,
                    },
                ]);

                await db
                    .rawDatabase('feature_lifecycles')
                    .where({
                        feature: flag.name,
                        stage: stage,
                    })
                    .update({
                        created_at: addMinutes(time, index),
                    });
            }
        }

        const otherProject = await db.stores.projectStore.create({
            name: 'project',
            id: randomId(),
        });
        const flagInOtherProject = await db.stores.featureToggleStore.create(
            otherProject.id,
            {
                name: randomId(),
                createdByUserId: 1,
            },
        );

        await db.stores.featureLifecycleStore.insert([
            {
                feature: flagInOtherProject.name,
                stage: 'initial',
            },
            {
                feature: flagInOtherProject.name,
                stage: 'pre-live',
            },
        ]);

        const result = await readModel.getCurrentFlagsInEachStage(project.id);

        expect(result).toMatchObject({
            initial: 1,
            'pre-live': 0,
            live: 2,
            completed: 1,
            archived: 0,
        });
    });

    test('if a flag is archived, but does not have the corresponding lifecycle stage, we still count it as archived and exclude it from other stages', async () => {
        const project = await db.stores.projectStore.create({
            name: 'project',
            id: randomId(),
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

        await db.stores.featureToggleStore.archive(flag.name);

        const result = await readModel.getCurrentFlagsInEachStage(project.id);

        expect(result).toMatchObject({
            initial: 0,
            archived: 1,
        });
    });

    test('the archived count is based on the features table (source of truth), not the lifecycle table', async () => {
        const project = await db.stores.projectStore.create({
            name: 'project',
            id: randomId(),
        });

        const flag = await db.stores.featureToggleStore.create(project.id, {
            name: randomId(),
            createdByUserId: 1,
        });

        await db.stores.featureToggleStore.archive(flag.name);

        const result = await readModel.getCurrentFlagsInEachStage(project.id);

        expect(result).toMatchObject({
            initial: 0,
            archived: 1,
        });
    });
});
