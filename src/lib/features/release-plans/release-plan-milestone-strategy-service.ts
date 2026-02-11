import type {
    IAuditUser,
    IConstraint,
    IStrategyVariant,
    IUnleashConfig,
} from '../../types/index.js';
import type { IUser } from '../../types/user.js';
import type { Logger } from '../../logger.js';
import type { ReleasePlanMilestoneStrategyStore } from './release-plan-milestone-strategy-store.js';
import type { FeatureToggleService } from '../feature-toggle/feature-toggle-service.js';
import type { WithTransactional } from '../../db/transaction.js';

export interface IReleasePlanMilestoneStrategyService {
    updateStrategy(
        strategyId: string,
        updates: MilestoneStrategyUpdate,
        context: IMilestoneStrategyContext,
        auditUser: IAuditUser,
        user?: IUser,
    ): Promise<void>;
}

type MilestoneStrategyUpdate = {
    name?: string;
    title?: string;
    parameters?: Record<string, string>;
    constraints?: IConstraint[];
    variants?: IStrategyVariant[];
    segments?: number[];
};

interface IMilestoneStrategyContext {
    projectId: string;
    environment: string;
    featureName: string;
}

export class ReleasePlanMilestoneStrategyService
    implements IReleasePlanMilestoneStrategyService
{
    private readonly logger: Logger;
    private readonly milestoneStrategyStore: ReleasePlanMilestoneStrategyStore;
    private readonly transactionalFeatureToggleService: WithTransactional<FeatureToggleService>;

    constructor(
        {
            milestoneStrategyStore,
        }: {
            milestoneStrategyStore: ReleasePlanMilestoneStrategyStore;
        },
        {
            featureToggleService,
        }: {
            featureToggleService: WithTransactional<FeatureToggleService>;
        },
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.logger = getLogger(
            'services/release-plan-milestone-strategy-service.ts',
        );
        this.milestoneStrategyStore = milestoneStrategyStore;
        this.transactionalFeatureToggleService = featureToggleService;
    }

    async updateStrategy(
        strategyId: string,
        updates: MilestoneStrategyUpdate,
        context: IMilestoneStrategyContext,
        auditUser: IAuditUser,
        user?: IUser,
    ): Promise<void> {
        const { projectId, environment, featureName } = context;

        let isActive: boolean;
        try {
            isActive = Boolean(
                await this.transactionalFeatureToggleService.getStrategy(
                    strategyId,
                ),
            );
        } catch {
            isActive = false;
        }

        const shouldSyncStrategies = isActive;
        if (shouldSyncStrategies) {
            await this.transactionalFeatureToggleService.transactional(
                (service) =>
                    service.updateStrategy(
                        strategyId,
                        {
                            name: updates.name,
                            title: updates.title,
                            parameters: updates.parameters,
                            constraints: updates.constraints,
                            variants: updates.variants,
                            segments: updates.segments,
                        },
                        { projectId, environment, featureName },
                        auditUser,
                        user,
                    ),
            );
        } else {
            await this.updateMilestoneStrategy(
                strategyId,
                updates,
                context,
                auditUser,
            );
        }
    }

    private async updateMilestoneStrategy(
        strategyId: string,
        updates: MilestoneStrategyUpdate,
        context: IMilestoneStrategyContext,
        auditUser: IAuditUser,
    ): Promise<void> {
        const columnUpdates = {
            ...(updates.title !== undefined && { title: updates.title }),
            ...(updates.name !== undefined && {
                strategy_name: updates.name,
            }),
            ...(updates.parameters !== undefined && {
                parameters: updates.parameters,
            }),
            ...(updates.constraints !== undefined && {
                constraints: JSON.stringify(updates.constraints),
            }),
            ...(updates.variants !== undefined && {
                variants: JSON.stringify(updates.variants),
            }),
        };

        await this.milestoneStrategyStore.updateWithSegments(
            strategyId,
            columnUpdates,
            updates.segments,
        );

        this.logger.info(
            `${auditUser.username} updates inactive milestone strategy ${strategyId} for feature ${context.featureName}`,
        );
    }
}
