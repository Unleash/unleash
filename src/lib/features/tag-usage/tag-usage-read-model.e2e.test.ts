import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import { TagUsageReadModel } from './tag-usage-read-model.js';

let db: ITestDb;
let readModel: TagUsageReadModel;

const TYPE = 'team';
const OTHER_PROJECT = 'tag-value-usage-other';
const ALL = { limit: 100, offset: 0 };

// Cells are feature flags; [A] = archived.
//
//                   | project: default           | project: OTHER_PROJECT
// ------------------+----------------------------+-------------------------------
// tag team:checkout |                            | flag checkout-archived [A]
// tag team:payments | flag payments-active       | flag payments-other
//                   | flag payments-archived [A] |
// tag team:unused   |                            |
beforeAll(async () => {
    db = await dbInit('tag_usage_read_model_serial', getLogger);
    readModel = new TagUsageReadModel(db.rawDatabase);
    const { stores } = db;

    await stores.projectStore.create({
        id: OTHER_PROJECT,
        name: 'Other',
        description: '',
        mode: 'open',
    });
    await stores.tagTypeStore.createTagType({ name: TYPE });
    for (const value of ['checkout', 'payments', 'unused']) {
        await stores.tagStore.createTag({ type: TYPE, value });
    }

    const flags: [string, string, string][] = [
        ['payments-active', 'default', 'payments'],
        ['payments-archived', 'default', 'payments'],
        ['payments-other', OTHER_PROJECT, 'payments'],
        ['checkout-archived', OTHER_PROJECT, 'checkout'],
    ];
    for (const [name, project, value] of flags) {
        await stores.featureToggleStore.create(project, {
            name,
            createdByUserId: 9999,
        });
        await stores.featureTagStore.tagFeature(
            name,
            { type: TYPE, value },
            9999,
        );
    }
    await stores.featureToggleStore.archive('payments-archived');
    await stores.featureToggleStore.archive('checkout-archived');
});

afterAll(async () => {
    await db.destroy();
});

test('counts active and archived flags per tag value', async () => {
    const usage = await readModel.getTagValueUsage(TYPE, ALL);

    expect(usage).toEqual({
        total: 3,
        tagValues: [
            {
                value: 'checkout',
                usedInActiveFeatures: 0,
                usedInArchivedFeatures: 1,
            },
            {
                value: 'payments',
                usedInActiveFeatures: 2,
                usedInArchivedFeatures: 1,
            },
            {
                value: 'unused',
                usedInActiveFeatures: 0,
                usedInArchivedFeatures: 0,
            },
        ],
    });
});

test('pages through values sorted by value', async () => {
    const usage = await readModel.getTagValueUsage(TYPE, {
        limit: 1,
        offset: 1,
    });

    expect(usage).toMatchObject({
        total: 3,
        tagValues: [{ value: 'payments' }],
    });
});

test('counts only flags in the given projects but keeps listing every value', async () => {
    const usage = await readModel.getTagValueUsage(TYPE, ALL, ['default']);

    expect(usage).toEqual({
        total: 3,
        tagValues: [
            {
                value: 'checkout',
                usedInActiveFeatures: 0,
                usedInArchivedFeatures: 0,
            },
            {
                value: 'payments',
                usedInActiveFeatures: 1,
                usedInArchivedFeatures: 1,
            },
            {
                value: 'unused',
                usedInActiveFeatures: 0,
                usedInArchivedFeatures: 0,
            },
        ],
    });
});
