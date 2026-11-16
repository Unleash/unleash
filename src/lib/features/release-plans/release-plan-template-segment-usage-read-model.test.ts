import { ulid } from 'ulidx';
import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import { TEST_AUDIT_USER } from '../../types/index.js';
import { DEFAULT_ENV, randomId } from '../../util/index.js';
import { ReleasePlanTemplateSegmentUsageReadModel } from './release-plan-template-segment-usage-read-model.js';
import type { IReleasePlanTemplateSegmentUsageReadModel } from './release-plan-template-segment-usage-read-model-type.js';

let db: ITestDb;
let readModel: IReleasePlanTemplateSegmentUsageReadModel;

beforeAll(async () => {
    db = await dbInit(
        'release_plan_template_segment_usage_read_model',
        getLogger,
    );
    readModel = new ReleasePlanTemplateSegmentUsageReadModel(db.rawDatabase);
});

afterAll(async () => {
    await db.destroy();
});

const createSegment = () =>
    db.stores.segmentStore.create(
        { name: randomId(), constraints: [], createdAt: new Date() },
        TEST_AUDIT_USER,
    );

const createTemplate = () =>
    db.stores.releasePlanTemplateStore.insert({
        name: randomId(),
        discriminator: 'template',
        createdByUserId: 1,
    });

const useSegmentIn = async (
    releasePlanDefinitionId: string,
    segmentId: number,
) => {
    const milestone = await db.stores.releasePlanMilestoneStore.insert({
        name: 'Stage 1',
        sortOrder: 0,
        releasePlanDefinitionId,
    });
    await db.stores.releasePlanMilestoneStrategyStore.insert({
        milestoneId: milestone.id,
        sortOrder: 0,
        name: 'flexibleRollout',
        segments: [segmentId],
    });
};

test('a template uses its segment until the template is archived', async () => {
    const segment = await createSegment();
    const template = await createTemplate();
    await useSegmentIn(template.id, segment.id);

    expect(await readModel.isSegmentUsedInActiveTemplates(segment.id)).toBe(
        true,
    );

    await db.stores.releasePlanTemplateStore.archive(template.id);

    expect(await readModel.isSegmentUsedInActiveTemplates(segment.id)).toBe(
        false,
    );
});

test('a release plan using the segment is not a template using it', async () => {
    const segment = await createSegment();
    const template = await createTemplate();
    const featureName = randomId();
    await db.stores.featureToggleStore.create('default', {
        name: featureName,
        createdByUserId: 9999,
    });
    const plan = await db.stores.releasePlanStore.insert({
        id: ulid(),
        name: randomId(),
        featureName,
        environment: DEFAULT_ENV,
        createdByUserId: 1,
        releasePlanTemplateId: template.id,
    });
    await useSegmentIn(plan.id, segment.id);

    expect(await readModel.isSegmentUsedInActiveTemplates(segment.id)).toBe(
        false,
    );
});

test('a template using another segment does not use this one', async () => {
    const segment = await createSegment();
    const otherSegment = await createSegment();
    const template = await createTemplate();
    await useSegmentIn(template.id, otherSegment.id);

    expect(await readModel.isSegmentUsedInActiveTemplates(segment.id)).toBe(
        false,
    );
});
