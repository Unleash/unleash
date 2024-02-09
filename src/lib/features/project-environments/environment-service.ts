import {
    DEFAULT_STRATEGY_UPDATED,
    IEnvironment,
    IEnvironmentStore,
    IFeatureEnvironmentStore,
    IFeatureStrategiesStore,
    IProjectEnvironment,
    ISortOrder,
    IUnleashConfig,
    IUnleashStores,
    PROJECT_ENVIRONMENT_ADDED,
    PROJECT_ENVIRONMENT_REMOVED,
    SYSTEM_USER,
} from '../../types';
import { Logger } from '../../logger';
import { BadDataError, UNIQUE_CONSTRAINT_VIOLATION } from '../../error';
import NameExistsError from '../../error/name-exists-error';
import { sortOrderSchema } from '../../services/state-schema';
import NotFoundError from '../../error/notfound-error';
import { IProjectStore } from '../../features/project/project-store-type';
import MinimumOneEnvironmentError from '../../error/minimum-one-environment-error';
import { IFlagResolver } from '../../types/experimental';
import { CreateFeatureStrategySchema } from '../../openapi';
import EventService from '../events/event-service';

export default class EnvironmentService {
    private logger: Logger;

    private environmentStore: IEnvironmentStore;

    private featureStrategiesStore: IFeatureStrategiesStore;

    private projectStore: IProjectStore;

    private featureEnvironmentStore: IFeatureEnvironmentStore;

    private eventService: EventService;

    private flagResolver: IFlagResolver;

    constructor(
        {
            environmentStore,
            featureStrategiesStore,
            featureEnvironmentStore,
            projectStore,
        }: Pick<
            IUnleashStores,
            | 'environmentStore'
            | 'featureStrategiesStore'
            | 'featureEnvironmentStore'
            | 'projectStore'
        >,
        {
            getLogger,
            flagResolver,
        }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>,
        eventService: EventService,
    ) {
        this.logger = getLogger('services/environment-service.ts');
        this.environmentStore = environmentStore;
        this.featureStrategiesStore = featureStrategiesStore;
        this.featureEnvironmentStore = featureEnvironmentStore;
        this.projectStore = projectStore;
        this.eventService = eventService;
        this.flagResolver = flagResolver;
    }

    async getAll(): Promise<IEnvironment[]> {
        return this.environmentStore.getAllWithCounts();
    }

    async get(name: string): Promise<IEnvironment> {
        return this.environmentStore.get(name);
    }

    async getProjectEnvironments(
        projectId: string,
    ): Promise<IProjectEnvironment[]> {
        return this.environmentStore.getProjectEnvironments(projectId);
    }

    async updateSortOrder(sortOrder: ISortOrder): Promise<void> {
        await sortOrderSchema.validateAsync(sortOrder);
        await Promise.all(
            Object.keys(sortOrder).map((key) => {
                const value = sortOrder[key];
                return this.environmentStore.updateSortOrder(key, value);
            }),
        );
    }

    async toggleEnvironment(name: string, value: boolean): Promise<void> {
        const exists = await this.environmentStore.exists(name);
        if (exists) {
            return this.environmentStore.updateProperty(name, 'enabled', value);
        }
        throw new NotFoundError(`Could not find environment ${name}`);
    }

    async addEnvironmentToProject(
        environment: string,
        projectId: string,
        username: string,
        userId: number,
    ): Promise<void> {
        try {
            await this.featureEnvironmentStore.connectProject(
                environment,
                projectId,
            );
            await this.featureEnvironmentStore.connectFeatures(
                environment,
                projectId,
            );
            await this.eventService.storeEvent({
                type: PROJECT_ENVIRONMENT_ADDED,
                project: projectId,
                environment,
                createdBy: username,
                createdByUserId: userId,
            });
        } catch (e) {
            if (e.code === UNIQUE_CONSTRAINT_VIOLATION) {
                throw new NameExistsError(
                    `${projectId} already has the environment ${environment} enabled`,
                );
            }
            throw e;
        }
    }

    async updateDefaultStrategy(
        environment: string,
        projectId: string,
        strategy: CreateFeatureStrategySchema,
        username: string,
        userId: number,
    ): Promise<CreateFeatureStrategySchema> {
        if (strategy.name !== 'flexibleRollout') {
            throw new BadDataError(
                'Only "flexibleRollout" strategy can be used as a default strategy for an environment',
            );
        }
        const previousDefaultStrategy =
            await this.projectStore.getDefaultStrategy(projectId, environment);
        const defaultStrategy = await this.projectStore.updateDefaultStrategy(
            projectId,
            environment,
            strategy,
        );
        await this.eventService.storeEvent({
            type: DEFAULT_STRATEGY_UPDATED,
            project: projectId,
            environment,
            createdBy: username,
            preData: previousDefaultStrategy,
            data: defaultStrategy,
            createdByUserId: userId,
        });

        return defaultStrategy;
    }

    async overrideEnabledProjects(
        environmentNamesToEnable: string[],
    ): Promise<void> {
        if (environmentNamesToEnable.length === 0) {
            return Promise.resolve();
        }

        const allEnvironments = await this.environmentStore.getAll();
        const existingEnvironmentsToEnable = allEnvironments.filter((env) =>
            environmentNamesToEnable.includes(env.name),
        );

        if (
            existingEnvironmentsToEnable.length !==
            environmentNamesToEnable.length
        ) {
            this.logger.warn(
                "Found environment enabled overrides but some of the specified environments don't exist, no overrides will be executed",
            );
            return Promise.resolve();
        }

        const environmentsNotAlreadyEnabled =
            existingEnvironmentsToEnable.filter((env) => !env.enabled);
        const environmentsToDisable = allEnvironments.filter((env) => {
            return !environmentNamesToEnable.includes(env.name) && env.enabled;
        });

        await this.environmentStore.disable(environmentsToDisable);
        await this.environmentStore.enable(environmentsNotAlreadyEnabled);

        await this.remapProjectsLinks(
            environmentsToDisable,
            environmentsNotAlreadyEnabled,
        );
    }

    private async remapProjectsLinks(
        toDisable: IEnvironment[],
        toEnable: IEnvironment[],
    ) {
        const projectLinks =
            await this.projectStore.getProjectLinksForEnvironments(
                toDisable.map((env) => env.name),
            );

        const unlinkTasks = projectLinks.map((link) => {
            return this.forceRemoveEnvironmentFromProject(
                link.environmentName,
                link.projectId,
            );
        });
        await Promise.all(unlinkTasks.flat());

        const uniqueProjects = [
            ...new Set(projectLinks.map((link) => link.projectId)),
        ];

        const linkTasks = uniqueProjects.flatMap((project) => {
            return toEnable.map((enabledEnv) => {
                return this.addEnvironmentToProject(
                    enabledEnv.name,
                    project,
                    SYSTEM_USER.username,
                    SYSTEM_USER.id,
                );
            });
        });

        await Promise.all(linkTasks);
    }

    async forceRemoveEnvironmentFromProject(
        environment: string,
        projectId: string,
    ): Promise<void> {
        await this.featureEnvironmentStore.disconnectFeatures(
            environment,
            projectId,
        );
        await this.featureEnvironmentStore.disconnectProject(
            environment,
            projectId,
        );
    }

    async removeEnvironmentFromProject(
        environment: string,
        projectId: string,
        username: string,
        userId: number,
    ): Promise<void> {
        const projectEnvs =
            await this.projectStore.getEnvironmentsForProject(projectId);

        if (projectEnvs.length > 1) {
            await this.forceRemoveEnvironmentFromProject(
                environment,
                projectId,
            );
            await this.eventService.storeEvent({
                type: PROJECT_ENVIRONMENT_REMOVED,
                project: projectId,
                environment,
                createdBy: username,
                createdByUserId: userId,
            });
            return;
        }
        throw new MinimumOneEnvironmentError(
            'You must always have one active environment',
        );
    }
}
