import { IUnleashStores } from '../types/stores';
import { IUnleashConfig } from '../types/option';
import EnvironmentStore from '../db/environment-store';
import { Logger } from '../logger';
import { IEnvironment } from '../types/model';
import FeatureStrategiesStore from '../db/feature-strategy-store';
import { UNIQUE_CONSTRAINT_VIOLATION } from '../error/db-error';
import NameExistsError from '../error/name-exists-error';

export default class EnvironmentService {
    private logger: Logger;

    private environmentStore: EnvironmentStore;

    private featureStrategiesStore: FeatureStrategiesStore;

    constructor(
        {
            environmentStore,
            featureStrategiesStore,
        }: Pick<IUnleashStores, 'environmentStore' | 'featureStrategiesStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.logger = getLogger('services/environment-service.ts');
        this.environmentStore = environmentStore;
        this.featureStrategiesStore = featureStrategiesStore;
    }

    async getAll(): Promise<IEnvironment[]> {
        return this.environmentStore.getAll();
    }

    async get(name: string): Promise<IEnvironment> {
        return this.environmentStore.getByName(name);
    }

    async delete(name: string): Promise<void> {
        return this.environmentStore.delete(name);
    }

    async create(env: IEnvironment): Promise<IEnvironment> {
        return this.environmentStore.upsert(env);
    }

    async update(
        name: string,
        env: Pick<IEnvironment, 'displayName'>,
    ): Promise<IEnvironment> {
        return this.environmentStore.upsert({ ...env, name });
    }

    async connectProjectToEnvironment(
        environment: string,
        projectId: string,
    ): Promise<void> {
        try {
            await this.environmentStore.connectProject(environment, projectId);
            await this.environmentStore.connectFeatures(environment, projectId);
        } catch (e) {
            if (e.code === UNIQUE_CONSTRAINT_VIOLATION) {
                throw new NameExistsError(
                    `${projectId} already has the environment ${environment} enabled`,
                );
            }
        }
    }

    async removeEnvironmentFromProject(
        environment: string,
        projectId: string,
    ): Promise<void> {
        await this.environmentStore.disconnectProjectFromEnv(
            environment,
            projectId,
        );
        await this.featureStrategiesStore.disconnectEnvironmentFromProject(
            environment,
            projectId,
        );
    }
}
