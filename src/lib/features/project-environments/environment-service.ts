import {
    DefaultStrategyUpdatedEvent,
    type IAuditUser,
    type IEnvironment,
    IEnvironmentCreate,
    type IEnvironmentStore,
    type IFeatureEnvironmentStore,
    type IFeatureStrategiesStore,
    type IProjectsAvailableOnEnvironment,
    type ISortOrder,
    type IUnleashConfig,
    type IUnleashStores,
    ProjectEnvironmentAdded,
    ProjectEnvironmentRemoved,
    SYSTEM_USER_AUDIT,
} from '../../types/index.js';
import type { Logger } from '../../logger.js';
import {
    BadDataError,
    UNIQUE_CONSTRAINT_VIOLATION,
} from '../../error/index.js';
import NameExistsError from '../../error/name-exists-error.js';
import { sortOrderSchema } from '../../services/sort-order-schema.js';
import NotFoundError from '../../error/notfound-error.js';
import type { IProjectStore } from '../../features/project/project-store-type.js';
import type { IFlagResolver } from '../../types/experimental.js';
import type { CreateFeatureStrategySchema } from '../../openapi/index.js';
import type EventService from '../events/event-service.js';

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
        const env = await this.environmentStore.get(name);
        if (env === undefined) {
            throw new NotFoundError(
                `Could not find environment with name ${name}`,
            );
        }
        return env;
    }

    async exists(name: string): Promise<boolean> {
        return this.environmentStore.exists(name);
    }

    async getProjectEnvironments(
        projectId: string,
    ): Promise<IProjectsAvailableOnEnvironment[]> {
        // This function produces an object for every environment, in that object is a boolean
        // describing whether that environment is enabled - aka not deprecated
        const environments =
            await this.projectStore.getEnvironmentsForProject(projectId);
        const environmentsOnProject = new Set(
            environments.map((env) => env.environment),
        );

        const allEnvironments =
            await this.environmentStore.getProjectEnvironments(projectId);

        return allEnvironments.map((env) => {
            return {
                ...env,
                visible: environmentsOnProject.has(env.name),
            };
        });
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

    async updateEnvironment(data: Pick<IEnvironment, "type" | "protected" | "requiredApprovals">, name: string): Promise<IEnvironment> {
        const exists = await this.environmentStore.exists(name);
        if (exists) {
            return this.environmentStore.update(data, name);
        }
        throw new NotFoundError(`Could not update environment, not find ${name}`);
    }

    async createEnvironment(data: IEnvironmentCreate): Promise<IEnvironment> {
        const exists = await this.environmentStore.exists(data.name);
        if (!exists) {
            return this.environmentStore.create(data);
        }
        throw new NotFoundError(`Could not create environment, same already exist ${data.name}`);
    }

    async toggleEnvironment(name: string, value: boolean): Promise<void> {
        const exists = await this.environmentStore.exists(name);
        if (exists) {
            return this.environmentStore.toggle(name, value);
        }
        throw new NotFoundError(`Could not find environment ${name}`);
    }

    async addEnvironmentToProject(
        environment: string,
        projectId: string,
        auditUser: IAuditUser,
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
            await this.eventService.storeEvent(
                new ProjectEnvironmentAdded({
                    project: projectId,
                    environment,
                    auditUser,
                }),
            );
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
        auditUser: IAuditUser,
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
        await this.eventService.storeEvent(
            new DefaultStrategyUpdatedEvent({
                project: projectId,
                environment,
                preData: previousDefaultStrategy,
                data: defaultStrategy,
                auditUser,
            }),
        );

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
                    SYSTEM_USER_AUDIT,
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
        auditUser: IAuditUser,
    ): Promise<void> {
        const _projectEnvs =
            await this.projectStore.getEnvironmentsForProject(projectId);

        await this.forceRemoveEnvironmentFromProject(environment, projectId);
        await this.eventService.storeEvent(
            new ProjectEnvironmentRemoved({
                project: projectId,
                environment,
                auditUser,
            }),
        );
    }
}
