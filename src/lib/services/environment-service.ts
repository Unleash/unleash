import { IUnleashStores } from '../types/stores';
import { IUnleashConfig } from '../types/option';
import { Logger } from '../logger';
import { IEnvironment, ISortOrder } from '../types/model';
import { UNIQUE_CONSTRAINT_VIOLATION } from '../error/db-error';
import NameExistsError from '../error/name-exists-error';
import { sortOrderSchema } from './state-schema';
import NotFoundError from '../error/notfound-error';
import { IEnvironmentStore } from '../types/stores/environment-store';
import { IFeatureStrategiesStore } from '../types/stores/feature-strategies-store';
import { IFeatureEnvironmentStore } from '../types/stores/feature-environment-store';
import { IProjectStore } from 'lib/types/stores/project-store';
import MinimumOneEnvironmentError from '../error/minimum-one-environment-error';

export default class EnvironmentService {
    private logger: Logger;

    private environmentStore: IEnvironmentStore;

    private featureStrategiesStore: IFeatureStrategiesStore;

    private projectStore: IProjectStore;

    private featureEnvironmentStore: IFeatureEnvironmentStore;

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
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.logger = getLogger('services/environment-service.ts');
        this.environmentStore = environmentStore;
        this.featureStrategiesStore = featureStrategiesStore;
        this.featureEnvironmentStore = featureEnvironmentStore;
        this.projectStore = projectStore;
    }

    async getAll(): Promise<IEnvironment[]> {
        return this.environmentStore.getAll();
    }

    async get(name: string): Promise<IEnvironment> {
        return this.environmentStore.get(name);
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

    async overrideEnabledProjects(
        environmentsToEnable: string[],
    ): Promise<void> {
        if (environmentsToEnable.length === 0) {
            return Promise.resolve();
        }

        const environmentsExist = await Promise.all(
            environmentsToEnable.map((env) =>
                this.environmentStore.exists(env),
            ),
        );
        if (!environmentsExist.every((exists) => exists)) {
            this.logger.error(
                "Found environment enabled overrides but some of the specified environments don't exist, no overrides will be executed",
            );
            return;
        }
        await this.environmentStore.disableAllExcept(environmentsToEnable);
        await this.environmentStore.enable(environmentsToEnable);
    }

    async removeEnvironmentFromProject(
        environment: string,
        projectId: string,
    ): Promise<void> {
        const projectEnvs = await this.projectStore.getEnvironmentsForProject(
            projectId,
        );

        if (projectEnvs.length > 1) {
            await this.featureEnvironmentStore.disconnectFeatures(
                environment,
                projectId,
            );
            await this.featureEnvironmentStore.disconnectProject(
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
