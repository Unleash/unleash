import type { Db } from '../../db/db.js';
import type { IReleasePlanReadModel } from './release-plan-read-model-type.js';
import type { ReleasePlan } from './release-plan.js';

const TABLE = 'release_plan_definitions';

const selectColumns = [
    'rpd.id AS planId',
    'rpd.discriminator AS planDiscriminator',
    'rpd.name AS planName',
    'rpd.description as planDescription',
    'rpd.feature_name as planFeatureName',
    'rpd.environment as planEnvironment',
    'rpd.created_by_user_id as planCreatedByUserId',
    'rpd.created_at as planCreatedAt',
    'rpd.active_milestone_id as planActiveMilestoneId',
    'rpd.release_plan_template_id as planTemplateId',
    'mi.id AS milestoneId',
    'mi.name AS milestoneName',
    'mi.sort_order AS milestoneSortOrder',
    'mi.started_at AS milestoneStartedAt',
    'mp.transition_condition AS milestoneTransitionCondition',
    'ms.id AS strategyId',
    'ms.sort_order AS strategySortOrder',
    'ms.title AS strategyTitle',
    'ms.strategy_name AS strategyName',
    'ms.parameters AS strategyParameters',
    'ms.constraints AS strategyConstraints',
    'ms.variants AS strategyVariants',
    'mss.segment_id AS segmentId',
];

const processReleasePlanRows = (templateRows): ReleasePlan[] =>
    templateRows.reduce(
        (
            acc: ReleasePlan[],
            {
                planId,
                planDiscriminator,
                planName,
                planDescription,
                planFeatureName,
                planEnvironment,
                planCreatedByUserId,
                planCreatedAt,
                planActiveMilestoneId,
                planTemplateId,
                milestoneId,
                milestoneName,
                milestoneSortOrder,
                milestoneStartedAt,
                milestoneTransitionCondition,
                strategyId,
                strategySortOrder,
                strategyTitle,
                strategyName,
                strategyParameters,
                strategyConstraints,
                strategyVariants,
                segmentId,
            },
        ) => {
            let plan = acc.find(({ id }) => id === planId);

            if (!plan) {
                plan = {
                    id: planId,
                    discriminator: planDiscriminator,
                    name: planName,
                    description: planDescription,
                    featureName: planFeatureName,
                    environment: planEnvironment,
                    createdByUserId: planCreatedByUserId,
                    createdAt: planCreatedAt,
                    activeMilestoneId: planActiveMilestoneId,
                    releasePlanTemplateId: planTemplateId,
                    milestones: [],
                };
                acc.push(plan);
            }

            if (!milestoneId) {
                return acc;
            }

            let milestone = plan.milestones.find(
                ({ id }) => id === milestoneId,
            );
            if (!milestone) {
                milestone = {
                    id: milestoneId,
                    name: milestoneName,
                    sortOrder: milestoneSortOrder,
                    startedAt: milestoneStartedAt,
                    transitionCondition: milestoneTransitionCondition,
                    strategies: [],
                    releasePlanDefinitionId: planId,
                };
                plan.milestones.push(milestone);
            }

            if (!strategyId) {
                return acc;
            }

            let strategy = milestone.strategies?.find(
                ({ id }) => id === strategyId,
            );

            if (!strategy) {
                strategy = {
                    id: strategyId,
                    milestoneId: milestoneId,
                    sortOrder: strategySortOrder,
                    title: strategyTitle,
                    strategyName: strategyName,
                    parameters: strategyParameters ?? {},
                    constraints: strategyConstraints,
                    variants: strategyVariants ?? [],
                    segments: [],
                };
                milestone.strategies = [
                    ...(milestone.strategies || []),
                    strategy,
                ];
            }

            if (segmentId) {
                strategy.segments = [...(strategy.segments || []), segmentId];
            }

            return acc;
        },
        [],
    );

export class ReleasePlanReadModel implements IReleasePlanReadModel {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async getReleasePlans(
        featureName: string,
        environments: string[],
    ): Promise<Record<string, ReleasePlan[]>> {
        if (environments.length === 0) {
            return {};
        }

        const planRows = await this.db(`${TABLE} AS rpd`)
            .where('rpd.discriminator', 'plan')
            .andWhere('rpd.feature_name', featureName)
            .whereIn('rpd.environment', environments)
            .leftJoin(
                'milestones AS mi',
                'mi.release_plan_definition_id',
                'rpd.id',
            )
            .leftJoin(
                'milestone_progressions AS mp',
                'mp.source_milestone',
                'mi.id',
            )
            .leftJoin('milestone_strategies AS ms', 'ms.milestone_id', 'mi.id')
            .leftJoin(
                'milestone_strategy_segments AS mss',
                'mss.milestone_strategy_id',
                'ms.id',
            )
            .orderBy('rpd.environment', 'asc')
            .orderBy('mi.sort_order', 'asc')
            .orderBy('ms.sort_order', 'asc')
            .select(selectColumns);

        const allPlans = processReleasePlanRows(planRows);

        const plansByEnvironment: Record<string, ReleasePlan[]> = {};
        for (const plan of allPlans) {
            if (!plansByEnvironment[plan.environment]) {
                plansByEnvironment[plan.environment] = [];
            }
            plansByEnvironment[plan.environment].push(plan);
        }

        for (const env of environments) {
            if (!plansByEnvironment[env]) {
                plansByEnvironment[env] = [];
            }
        }

        return plansByEnvironment;
    }
}
