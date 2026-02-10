import type { ReleasePlan } from './release-plan.js';
import type { ReleasePlanMilestoneStrategy } from './release-plan-milestone-strategy.js';
import { CRUDStore, type CrudStoreConfig } from '../../db/crud/crud-store.js';
import type { Row } from '../../db/crud/row-type.js';
import type { Db } from '../../db/db.js';
import { defaultToRow } from '../../db/crud/default-mappings.js';
import type { IAuditUser } from '../../types/index.js';

const TABLE = 'release_plan_definitions';

type ReleasePlanWriteModel = Omit<
    ReleasePlan,
    'discriminator' | 'createdAt' | 'milestones'
>;

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

const processMilestoneStrategyRows = (
    rows: any,
): ReleasePlanMilestoneStrategy[] => {
    return rows.map((row) => {
        return {
            id: row.id,
            sortOrder: row.sort_order,
            title: row.title,
            strategyName: row.strategy_name,
            parameters: row.parameters,
            constraints: row.constraints,
            variants: row.variants,
            segments: [],
        };
    });
};

export class ReleasePlanStore extends CRUDStore<
    ReleasePlan,
    ReleasePlanWriteModel,
    Row<ReleasePlan>,
    ReleasePlan,
    string
> {
    constructor(db: Db, config: CrudStoreConfig) {
        super(TABLE, db, config, {
            fromRow: (row) => {
                return {
                    id: row.id,
                    discriminator: row.discriminator,
                    name: row.name,
                    description: row.description,
                    featureName: row.feature_name,
                    environment: row.environment,
                    createdByUserId: row.created_by_user_id,
                    createdAt: row.created_at,
                    activeMilestoneId: row.active_milestone_id,
                    releasePlanTemplateId: row.release_plan_template_id,
                    milestones: [],
                };
            },
            toRow: (item) => ({
                ...defaultToRow(item),
                discriminator: 'plan',
            }),
        });
    }

    override async count(
        query?: Partial<ReleasePlanWriteModel>,
    ): Promise<number> {
        let countQuery = this.db(this.tableName)
            .where('discriminator', 'plan')
            .count('*');
        if (query) {
            countQuery = countQuery.where(this.toRow(query));
        }
        const { count } = (await countQuery.first()) ?? { count: 0 };
        return Number(count);
    }

    async getByFeatureFlagEnvironmentAndPlanId(
        featureName: string,
        environment: string,
        planId: string,
    ): Promise<ReleasePlan> {
        const endTimer = this.timer('getByFeatureFlagEnvironmentAndPlanId');
        const rows = await this.db(`${this.tableName} AS rpd`)
            .where('rpd.discriminator', 'plan')
            .andWhere('rpd.feature_name', featureName)
            .andWhere('rpd.environment', environment)
            .andWhere('rpd.id', planId)
            .leftJoin(
                'milestones AS mi',
                'mi.release_plan_definition_id',
                'rpd.id',
            )
            .leftJoin('feature_strategies AS ms', 'ms.milestone_id', 'mi.id')
            .leftJoin(
                'feature_strategy_segment AS mss',
                'mss.feature_strategy_id',
                'ms.id',
            )
            .orderBy('mi.sort_order', 'asc')
            .orderBy('ms.sort_order', 'asc')
            .select(selectColumns);
        endTimer();
        return processReleasePlanRows(rows)[0];
    }

    async getByPlanId(planId: string): Promise<ReleasePlan | undefined> {
        const endTimer = this.timer('getByPlanId');
        const rows = await this.db(`${this.tableName} AS rpd`)
            .where('rpd.discriminator', 'plan')
            .andWhere('rpd.id', planId)
            .leftJoin(
                'milestones AS mi',
                'mi.release_plan_definition_id',
                'rpd.id',
            )
            .leftJoin('feature_strategies AS ms', 'ms.milestone_id', 'mi.id')
            .leftJoin(
                'feature_strategy_segment AS mss',
                'mss.feature_strategy_id',
                'ms.id',
            )
            .orderBy('mi.sort_order', 'asc')
            .orderBy('ms.sort_order', 'asc')
            .select(selectColumns);
        endTimer();
        const releasePlans = processReleasePlanRows(rows);
        if (releasePlans.length === 0) {
            return;
        }
        return releasePlans[0];
    }

    async activateStrategiesForMilestone(
        planId: string,
        auditUser: IAuditUser,
    ): Promise<ReleasePlanMilestoneStrategy[]> {
        const endTimer = this.timer('activateStrategiesForMilestone');
        const rows = await this.db.raw(
            `
            INSERT INTO feature_strategies(id, feature_name, project_name, environment, strategy_name, parameters, constraints, sort_order, title, variants, created_by_user_id, milestone_id)
            SELECT ms.id, rpd.feature_name, feature.project, rpd.environment, ms.strategy_name, ms.parameters, ms.constraints, ms.sort_order, ms.title, ms.variants, :userId, ms.milestone_id
                   FROM milestone_strategies AS ms
                   LEFT JOIN milestones AS m ON m.id = ms.milestone_id
                   LEFT JOIN release_plan_definitions AS rpd ON rpd.active_milestone_id = m.id AND rpd.discriminator = 'plan'
                   LEFT JOIN features AS feature ON rpd.feature_name = feature.name
                   WHERE rpd.id = :planId AND rpd.discriminator = 'plan'
                   ON CONFLICT DO NOTHING
            RETURNING *
        `,
            { userId: auditUser.id, planId },
        );
        endTimer();
        return processMilestoneStrategyRows(rows.rows);
    }

    async deactivateStrategiesForMilestone(
        templateId: string,
    ): Promise<ReleasePlanMilestoneStrategy[]> {
        const endTimer = this.timer('deactivateStrategiesForMilestone');
        const deletedRows = await this.db.raw(
            `DELETE FROM feature_strategies
             WHERE milestone_id = (SELECT active_milestone_id FROM release_plan_definitions WHERE id = :templateId)
             RETURNING *`,
            { templateId },
        );
        endTimer();
        return processMilestoneStrategyRows(deletedRows.rows);
    }

    async getActiveStrategiesForPlan(
        planId: string,
    ): Promise<ReleasePlanMilestoneStrategy[]> {
        const endTimer = this.timer('getActiveStrategiesForPlan');
        const rows = await this.db
            .select(
                'id',
                'strategy_name',
                'sort_order',
                'title',
                'parameters',
                'variants',
                'constraints',
            )
            .from('feature_strategies')
            .whereRaw(
                `milestone_id IN (SELECT active_milestone_id FROM release_plan_definitions WHERE id = :id)`,
                { id: planId },
            );
        endTimer();
        return processMilestoneStrategyRows(rows);
    }

    async activateStrategySegmentsForMilestone(
        milestone_id: string,
    ): Promise<number[]> {
        const endTimer = this.timer('activateStrategySegmentsForMilestone');
        const rows = await this.db.raw(
            `
            INSERT INTO feature_strategy_segment(feature_strategy_id, segment_id) SELECT milestone_strategy_id, segment_id FROM milestone_strategy_segments WHERE milestone_strategy_id IN (SELECT id FROM milestone_strategies WHERE milestone_id = :milestone_id) RETURNING segment_id
        `,
            { milestone_id },
        );
        endTimer();
        return rows.rows.map((row) => row.segment_id);
    }

    async insertAllMilestoneStrategiesForPlan(
        planId: string,
        auditUser: IAuditUser,
    ): Promise<ReleasePlanMilestoneStrategy[]> {
        const endTimer = this.timer('insertAllMilestoneStrategiesForPlan');
        const rows = await this.db.raw(
            `
            INSERT INTO feature_strategies(id, feature_name, project_name, environment, strategy_name, parameters, constraints, sort_order, title, variants, created_by_user_id, milestone_id)
            SELECT ms.id, rpd.feature_name, feature.project, rpd.environment, ms.strategy_name, ms.parameters, ms.constraints, ms.sort_order, ms.title, ms.variants, :userId, ms.milestone_id
                   FROM milestone_strategies AS ms
                   LEFT JOIN milestones AS m ON m.id = ms.milestone_id
                   LEFT JOIN release_plan_definitions AS rpd ON rpd.id = m.release_plan_definition_id AND rpd.discriminator = 'plan'
                   LEFT JOIN features AS feature ON rpd.feature_name = feature.name
                   WHERE rpd.id = :planId AND rpd.discriminator = 'plan'
                   ON CONFLICT DO NOTHING
            RETURNING *
        `,
            { userId: auditUser.id, planId },
        );
        endTimer();
        return processMilestoneStrategyRows(rows.rows);
    }

    async insertAllMilestoneSegmentsForPlan(planId: string): Promise<number[]> {
        const endTimer = this.timer('insertAllMilestoneSegmentsForPlan');
        const rows = await this.db.raw(
            `
            INSERT INTO feature_strategy_segment(feature_strategy_id, segment_id)
            SELECT mss.milestone_strategy_id, mss.segment_id
            FROM milestone_strategy_segments AS mss
            INNER JOIN milestone_strategies AS ms ON ms.id = mss.milestone_strategy_id
            INNER JOIN milestones AS m ON m.id = ms.milestone_id
            INNER JOIN release_plan_definitions AS rpd ON rpd.id = m.release_plan_definition_id AND rpd.discriminator = 'plan'
            WHERE rpd.id = :planId
            ON CONFLICT DO NOTHING
            RETURNING mss.segment_id
        `,
            { planId },
        );
        endTimer();
        return rows.rows.map((row: { segment_id: number }) => row.segment_id);
    }

    async getStrategiesForMilestone(
        milestoneId: string,
    ): Promise<ReleasePlanMilestoneStrategy[]> {
        const endTimer = this.timer('getStrategiesForMilestone');
        const rows = await this.db
            .select(
                'id',
                'strategy_name',
                'sort_order',
                'title',
                'parameters',
                'variants',
                'constraints',
            )
            .from('feature_strategies')
            .where('milestone_id', milestoneId);
        endTimer();
        return processMilestoneStrategyRows(rows);
    }

    async featureAndEnvironmentHasPlan(
        featureName: string,
        environment: string,
    ): Promise<boolean> {
        const endTimer = this.timer('featureAndEnvironmentHasPlan');
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE discriminator = 'plan' AND feature_name = :featureName AND environment = :environment) AS present`,
            { featureName, environment },
        );
        const { present } = result.rows[0];
        endTimer();
        return present;
    }

    async getByEnvironmentAndProjects(
        environment: string,
        projects: string[],
    ): Promise<ReleasePlan[]> {
        const endTimer = this.timer('getByEnvironmentAndProjects');
        const rows = await this.db(`${this.tableName} AS rpd`)
            .join('features AS f', 'f.name', 'rpd.feature_name')
            .where('rpd.discriminator', 'plan')
            .andWhere('rpd.environment', environment)
            .whereIn('f.project', projects)
            .leftJoin(
                'milestones AS mi',
                'mi.release_plan_definition_id',
                'rpd.id',
            )
            .leftJoin('feature_strategies AS ms', 'ms.milestone_id', 'mi.id')
            .leftJoin(
                'feature_strategy_segment AS mss',
                'mss.feature_strategy_id',
                'ms.id',
            )
            .orderBy('mi.sort_order', 'asc')
            .orderBy('ms.sort_order', 'asc')
            .select(selectColumns);
        endTimer();
        return processReleasePlanRows(rows);
    }
}
