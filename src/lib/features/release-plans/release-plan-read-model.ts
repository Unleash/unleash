import type { Db } from '../../db/db.js';
import type { IReleasePlanReadModel } from './release-plan-read-model-type.js';
import type { ReleasePlan } from './release-plan.js';
import metricsHelper from '../../util/metrics-helper.js';
import type EventEmitter from 'events';

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
    'mp.executed_at AS milestoneProgressionExecutedAt',
    'ms.id AS strategyId',
    'ms.sort_order AS strategySortOrder',
    'ms.title AS strategyTitle',
    'ms.strategy_name AS strategyName',
    'ms.parameters AS strategyParameters',
    'ms.constraints AS strategyConstraints',
    'ms.variants AS strategyVariants',
    'mss.segment_id AS segmentId',
    // Safeguards
    'sg.id AS safeguardId',
    'im.id AS safeguardImpactMetricId',
    'sg.action AS safeguardAction',
    'sg.trigger_condition AS safeguardTriggerCondition',
    // Impact metric (from im.config JSONB)
    "im.config->>'metricName' AS safeguardImpactMetricMetricName",
    "im.config->>'timeRange' AS safeguardImpactMetricTimeRange",
    "im.config->>'aggregationMode' AS safeguardImpactMetricAggregationMode",
    "im.config->'labelSelectors' AS safeguardImpactMetricLabelSelectors",
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
                milestoneProgressionExecutedAt,
                strategyId,
                strategySortOrder,
                strategyTitle,
                strategyName,
                strategyParameters,
                strategyConstraints,
                strategyVariants,
                segmentId,
                safeguardId,
                safeguardImpactMetricId,
                safeguardAction,
                safeguardTriggerCondition,
                safeguardImpactMetricId,
                safeguardImpactMetricMetricName,
                safeguardImpactMetricTimeRange,
                safeguardImpactMetricAggregationMode,
                safeguardImpactMetricLabelSelectors,
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
                    safeguards: [],
                    milestones: [],
                };
                acc.push(plan);
            }

            if (safeguardId) {
                const hasSafeguard = (plan.safeguards || []).some(
                    (sg) => sg.id === safeguardId,
                );
                if (!hasSafeguard) {
                    plan.safeguards = [
                        ...(plan.safeguards || []),
                        {
                            id: safeguardId,
                            action: safeguardAction,
                            triggerCondition: safeguardTriggerCondition,
                            impactMetric: {
                                id: safeguardImpactMetricId,
                                metricName: safeguardImpactMetricMetricName,
                                timeRange: safeguardImpactMetricTimeRange,
                                aggregationMode:
                                    safeguardImpactMetricAggregationMode,
                                labelSelectors:
                                    safeguardImpactMetricLabelSelectors ?? {},
                            },
                        },
                    ];
                }
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
                    progressionExecutedAt: milestoneProgressionExecutedAt,
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

    private timer: Function;

    constructor(db: Db, eventBus: EventEmitter) {
        this.db = db;
        this.timer = (action: string) =>
            metricsHelper.wrapTimer(eventBus, 'db_time', {
                store: 'release-plan-read-model',
                action,
            });
    }

    async getReleasePlans(
        featureName: string,
        environments: string[],
    ): Promise<Record<string, ReleasePlan[]>> {
        const endTimer = this.timer('getReleasePlans');
        if (environments.length === 0) {
            endTimer();
            return {};
        }

        const planRows = await this.db(`${TABLE} AS rpd`)
            .where('rpd.discriminator', 'plan')
            .andWhere('rpd.feature_name', featureName)
            .whereIn('rpd.environment', environments)
            // Join safeguards by JSONB action.id matching the plan id
            .leftJoin(
                this.db.raw("safeguards AS sg ON (sg.action->>'id') = rpd.id"),
            )
            .leftJoin('impact_metrics AS im', 'im.id', 'sg.impact_metric_id')
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

        endTimer();
        return plansByEnvironment;
    }
}
