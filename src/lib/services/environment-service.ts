import { IUnleashStores } from '../types/stores';
import { IUnleashConfig } from '../types/option';
import EnvironmentStore from '../db/environment-store';
import { Logger } from '../logger';
import { IEnvironment } from '../types/model';

export default class EnvironmentService {
    private logger: Logger;

    private environmentStore: EnvironmentStore;

    constructor(
        { environmentStore }: Pick<IUnleashStores, 'environmentStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.logger = getLogger('services/environment-service.ts');
        this.environmentStore = environmentStore;
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
}
