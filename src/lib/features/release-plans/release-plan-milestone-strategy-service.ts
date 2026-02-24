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
import {
    PermissionError,
    SKIP_CHANGE_REQUEST,
    type IChangeRequestAccessReadModel,
    type IUnleashServices,
    type IUnleashStores,
} from '../../server-impl.js';

type MilestoneStrategyContext = {
    projectId: string;
    environment: string;
    featureName: string;
};

export class ReleasePlanMilestoneStrategyService {
    private readonly logger: Logger;
    private readonly milestoneStrategyStore: IReleasePlanMilestoneStrategyStore;
    private readonly featureToggleService: FeatureToggleService;
    private changeRequestAccessReadModel: IChangeRequestAccessReadModel;

    constructor(
        {
            releasePlanMilestoneStrategyStore: milestoneStrategyStore,
        }: Pick<IUnleashStores, 'releasePlanMilestoneStrategyStore'>,
        {
            featureToggleService,
        }: Pick<IUnleashServices, 'featureToggleService'>,
        changeRequestAccessReadModel: IChangeRequestAccessReadModel,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.logger = getLogger(
            'services/release-plan-milestone-strategy-service.ts',
        );
        this.milestoneStrategyStore = milestoneStrategyStore;
        this.featureToggleService = featureToggleService;
        this.changeRequestAccessReadModel = changeRequestAccessReadModel;
    }

    async updateStrategy(
        id: string,
        strategy: Partial<MilestoneStrategyConfigUpdate>,
        context: MilestoneStrategyContext,
        auditUser: IAuditUser,
        user?: IUser,
    ): Promise<MilestoneStrategyConfig> {
        await this.stopWhenChangeRequestsEnabled(
            context.projectId,
            context.environment,
            user,
        );

        return this.unprotectedUpdateStrategy(
            id,
            strategy,
            context,
            auditUser,
            user,
        );
    }

    private async stopWhenChangeRequestsEnabled(
        project: string,
        environment: string,
        user?: IUser,
    ) {
        const canBypass =
            await this.changeRequestAccessReadModel.canBypassChangeRequest(
                project,
                environment,
                user,
            );
        if (!canBypass) {
            throw new PermissionError(SKIP_CHANGE_REQUEST);
        }
    }

    async unprotectedUpdateStrategy(
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
            await this.featureToggleService.unprotectedUpdateStrategy(
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
