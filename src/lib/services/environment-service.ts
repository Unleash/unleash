import {
    IEnvironment,
    IEnvironmentStore,
    IFeatureEnvironmentStore,
    IFeatureStrategiesStore,
    IProjectEnvironment,
    ISortOrder,
    IUnleashConfig,
    IUnleashStores,
} from '../types';
import { Logger } from '../logger';
import { BadDataError, UNIQUE_CONSTRAINT_VIOLATION } from '../error';
import NameExistsError from '../error/name-exists-error';
import { sortOrderSchema } from './state-schema';
import NotFoundError from '../error/notfound-error';
import { IProjectStore } from 'lib/types/stores/project-store';
import MinimumOneEnvironmentError from '../error/minimum-one-environment-error';
import { IFlagResolver } from 'lib/types/experimental';
import { CreateFeatureStrategySchema } from '../openapi';

export default class EnvironmentService {
    private logger: Logger;

    private environmentStore: IEnvironmentStore;

    private featureStrategiesStore: IFeatureStrategiesStore;

    private projectStore: IProjectStore;

    private featureEnvironmentStore: IFeatureEnvironmentStore;

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
    ) {
        this.logger = getLogger('services/environment-service.ts');
        this.environmentStore = environmentStore;
        this.featureStrategiesStore = featureStrategiesStore;
        this.featureEnvironmentStore = featureEnvironmentStore;
        this.projectStore = projectStore;
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
        } catch (e) {
            if (e.code === UNIQUE_CONSTRAINT_VIOLATION) {
                throw new NameExistsError(
                    `${projectId} already has the environment ${environment} enabled`,
                );
            }
            throw e;
        }
    }

    async addDefaultStrategy(
        environment: string,
        projectId: string,
        strategy: CreateFeatureStrategySchema,
    ): Promise<CreateFeatureStrategySchema> {
        if (strategy.name !== 'flexibleRollout') {
            throw new BadDataError(
                'Only "flexibleRollout" strategy can be used as a default strategy for an environment',
            );
        }
        return this.projectStore.updateDefaultStrategy(
            projectId,
            environment,
            strategy,
        );
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
            existingEnvironmentsToEnable.filter((env) => env.enabled == false);
        const environmentsToDisable = allEnvironments.filter((env) => {
            return (
                !environmentNamesToEnable.includes(env.name) &&
                env.enabled == true
            );
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

        let linkTasks = uniqueProjects.map((project) => {
            return toEnable.map((enabledEnv) => {
                return this.addEnvironmentToProject(enabledEnv.name, project);
            });
        });

        await Promise.all(linkTasks.flat());
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
    ): Promise<void> {
        const projectEnvs = await this.projectStore.getEnvironmentsForProject(
            projectId,
        );

        if (projectEnvs.length > 1) {
            await this.forceRemoveEnvironmentFromProject(
                environment,
                projectId,
            );
            return;
        }
        throw new MinimumOneEnvironmentError(
            'You must always have one active environment',
        );
    }
}
