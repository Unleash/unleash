import type {
    IAuditUser,
    IUnleashConfig,
    MilestoneStrategyConfig,
    MilestoneStrategyConfigUpdate,
} from '../../types/index.js';
import type { IUser } from '../../types/user.js';
import type { Logger } from '../../logger.js';
import type { IReleasePlanMilestoneStrategyStore } from './release-plan-milestone-strategy-store.js';
import type { FeatureToggleService } from '../feature-toggle/feature-toggle-service.js';

type MilestoneStrategyContext = {
    projectId: string;
    environment: string;
    featureName: string;
};

export class ReleasePlanMilestoneStrategyService {
    private readonly logger: Logger;
    private readonly milestoneStrategyStore: IReleasePlanMilestoneStrategyStore;
    private readonly featureToggleService: FeatureToggleService;

    constructor(
        {
            milestoneStrategyStore,
        }: {
            milestoneStrategyStore: IReleasePlanMilestoneStrategyStore;
        },
        {
            featureToggleService,
        }: {
            featureToggleService: FeatureToggleService;
        },
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.logger = getLogger(
            'services/release-plan-milestone-strategy-service.ts',
        );
        this.milestoneStrategyStore = milestoneStrategyStore;
        this.featureToggleService = featureToggleService;
    }

    async updateStrategy(
        id: string,
        strategy: Partial<MilestoneStrategyConfigUpdate>,
        context: MilestoneStrategyContext,
        auditUser: IAuditUser,
        user?: IUser,
    ): Promise<MilestoneStrategyConfig> {
        const { projectId, environment, featureName } = context;

        let isActive: boolean;
        try {
            isActive = Boolean(await this.featureToggleService.getStrategy(id));
        } catch {
            isActive = false;
        }

        const shouldSyncStrategies = isActive;
        if (shouldSyncStrategies) {
            await this.featureToggleService.updateStrategy(
                id,
                strategy,
                { projectId, environment, featureName },
                auditUser,
                user,
            );
        }

        const updatedStrategy = await this.milestoneStrategyStore.upsert(
            id,
            strategy,
        );

        this.logger.info(
            `${auditUser.username} updates milestone strategy ${id} for feature ${context.featureName}`,
        );

        return updatedStrategy;
    }
}
