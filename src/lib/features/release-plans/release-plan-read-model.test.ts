import { ulid } from 'ulidx';
import { EventEmitter } from 'events';
import dbInit, {
    type ITestDb,
} from '../../../test/e2e/helpers/database-init.js';
import getLogger from '../../../test/fixtures/no-logger.js';
import { ReleasePlanReadModel } from './release-plan-read-model.js';
import type { IReleasePlanReadModel } from './release-plan-read-model-type.js';
import type { IFeatureToggleStore } from '../feature-toggle/types/feature-toggle-store-type.js';
import type { ReleasePlanStore } from './release-plan-store.js';
import type { ReleasePlanMilestoneStore } from './release-plan-milestone-store.js';
import type { IFeatureEnvironmentStore } from '../../types/stores/feature-environment-store.js';

let db: ITestDb;
let releasePlanReadModel: IReleasePlanReadModel;
let featureToggleStore: IFeatureToggleStore;
let releasePlanStore: ReleasePlanStore;
let releasePlanMilestoneStore: ReleasePlanMilestoneStore;
let featureEnvironmentStore: IFeatureEnvironmentStore;
let eventBus: EventEmitter;

beforeAll(async () => {
    db = await dbInit('release_plan_read_model', getLogger);
    eventBus = new EventEmitter();
    releasePlanReadModel = new ReleasePlanReadModel(db.rawDatabase, eventBus);
    featureToggleStore = db.stores.featureToggleStore;
    releasePlanStore = db.stores.releasePlanStore;
    releasePlanMilestoneStore = db.stores.releasePlanMilestoneStore;
    featureEnvironmentStore = db.stores.featureEnvironmentStore;
});

afterAll(async () => {
    if (db) {
        await db.destroy();
    }
});

beforeEach(async () => {
    await releasePlanStore.deleteAll();
    await releasePlanMilestoneStore.deleteAll();
    await featureToggleStore.deleteAll();
    await featureEnvironmentStore.deleteAll();

    await db.rawDatabase('milestone_progressions').del();
});

const createReleasePlan = async (planData: {
    name: string;
    description: string;
    featureName: string;
    environment: string;
    createdByUserId: number;
    activeMilestoneId?: string;
}) => {
    const id = ulid();
    await db.rawDatabase('release_plan_definitions').insert({
        id,
        name: planData.name,
        description: planData.description,
        feature_name: planData.featureName,
        environment: planData.environment,
        created_by_user_id: planData.createdByUserId,
        active_milestone_id: planData.activeMilestoneId || null,
        discriminator: 'plan',
        created_at: new Date(),
    });
    return {
        id,
        name: planData.name,
        description: planData.description,
        featureName: planData.featureName,
        environment: planData.environment,
        createdByUserId: planData.createdByUserId,
        activeMilestoneId: planData.activeMilestoneId || null,
    };
};

const createMilestone = async (milestoneData: {
    name: string;
    sortOrder: number;
    releasePlanDefinitionId: string;
    startedAt?: Date;
}) => {
    const milestone = await releasePlanMilestoneStore.insert({
        name: milestoneData.name,
        sortOrder: milestoneData.sortOrder,
        releasePlanDefinitionId: milestoneData.releasePlanDefinitionId,
    });

    if (milestoneData.startedAt) {
        await db
            .rawDatabase('milestones')
            .where('id', milestone.id)
            .update('started_at', milestoneData.startedAt);
    }

    return {
        id: milestone.id,
        name: milestone.name,
        sortOrder: milestone.sortOrder,
        releasePlanDefinitionId: milestone.releasePlanDefinitionId,
        startedAt: milestoneData.startedAt || null,
    };
};

const createMilestoneProgression = async (progressionData: {
    sourceMilestoneId: string;
    targetMilestoneId: string;
    transitionCondition?: object;
    executedAt?: Date;
}) => {
    await db.rawDatabase('milestone_progressions').insert({
        source_milestone: progressionData.sourceMilestoneId,
        target_milestone: progressionData.targetMilestoneId,
        transition_condition: progressionData.transitionCondition || null,
        executed_at: progressionData.executedAt || null,
    });
    return {
        transitionCondition: progressionData.transitionCondition || null,
        executedAt: progressionData.executedAt || null,
    };
};

test('should return release plans with complete milestone data', async () => {
    await featureToggleStore.create('default', {
        name: 'test-feature',
        createdByUserId: 1,
    });
    await featureEnvironmentStore.addEnvironmentToFeature(
        'test-feature',
        'development',
        true,
    );

    const plan = await createReleasePlan({
        name: 'Test Plan',
        description: 'Test plan',
        featureName: 'test-feature',
        environment: 'development',
        createdByUserId: 1,
    });

    const startedAt = new Date('2024-01-10T08:00:00.000Z');
    const milestone1 = await createMilestone({
        name: 'Milestone 1',
        sortOrder: 1,
        releasePlanDefinitionId: plan.id,
        startedAt: startedAt,
    });

    const milestone2 = await createMilestone({
        name: 'Milestone 2',
        sortOrder: 2,
        releasePlanDefinitionId: plan.id,
    });

    await releasePlanStore.update(plan.id, {
        activeMilestoneId: milestone1.id,
    });

    const transitionCondition = { intervalMinutes: 60 };
    const executedAt = new Date('2024-01-15T10:00:00.000Z');
    const milestoneProgression = await createMilestoneProgression({
        sourceMilestoneId: milestone1.id,
        targetMilestoneId: milestone2.id,
        transitionCondition: transitionCondition,
        executedAt: executedAt,
    });

    const impactMetricId = ulid();
    await db.rawDatabase('impact_metrics').insert({
        id: impactMetricId,
        feature: 'test-feature',
        config: {
            id: impactMetricId,
            metricName: 'errors_total',
            timeRange: 'hour',
            yAxisMin: 'auto',
            aggregationMode: 'count',
            labelSelectors: { service: ['api'] },
        },
    });

    const safeguardId = ulid();
    await db.rawDatabase('safeguards').insert({
        id: safeguardId,
        impact_metric_id: impactMetricId,
        action: { type: 'disableReleasePlan', id: plan.id },
        trigger_condition: { operator: '>', threshold: 100 },
    });

    const releasePlans = await releasePlanReadModel.getReleasePlans(
        'test-feature',
        ['development'],
    );

    expect(releasePlans).toMatchObject({
        development: [
            {
                id: plan.id,
                discriminator: 'plan',
                name: plan.name,
                description: plan.description,
                featureName: plan.featureName,
                environment: plan.environment,
                createdByUserId: plan.createdByUserId,
                createdAt: expect.any(Date),
                activeMilestoneId: milestone1.id,
                releasePlanTemplateId: null,
                safeguards: [
                    {
                        id: safeguardId,
                        action: { type: 'disableReleasePlan', id: plan.id },
                        triggerCondition: { operator: '>', threshold: 100 },
                        impactMetric: {
                            id: impactMetricId,
                            metricName: 'errors_total',
                            timeRange: 'hour',
                            aggregationMode: 'count',
                            labelSelectors: { service: ['api'] },
                        },
                    },
                ],
                milestones: [
                    {
                        id: milestone1.id,
                        name: milestone1.name,
                        sortOrder: milestone1.sortOrder,
                        releasePlanDefinitionId:
                            milestone1.releasePlanDefinitionId,
                        startedAt: milestone1.startedAt,
                        progressionExecutedAt: milestoneProgression.executedAt,
                        transitionCondition:
                            milestoneProgression.transitionCondition,
                        strategies: [],
                    },
                    {
                        id: milestone2.id,
                        name: milestone2.name,
                        sortOrder: milestone2.sortOrder,
                        releasePlanDefinitionId:
                            milestone2.releasePlanDefinitionId,
                        startedAt: milestone2.startedAt,
                        progressionExecutedAt: null,
                        transitionCondition: null,
                        strategies: [],
                    },
                ],
            },
        ],
    });
});
