import type {
    IClientInstance,
    IClientInstanceStore,
    INewClientInstance,
} from '../../lib/types/stores/client-instance-store.js';
import NotFoundError from '../../lib/error/notfound-error.js';
import groupBy from 'lodash.groupby';

export default class FakeClientInstanceStore implements IClientInstanceStore {
    instances: IClientInstance[] = [];

    async bulkUpsert(instances: INewClientInstance[]): Promise<void> {
        instances.forEach((i) => {
            this.instances.push({ createdAt: new Date(), ...i });
        });
    }

    async delete(
        key: Pick<INewClientInstance, 'appName' | 'instanceId'>,
    ): Promise<void> {
        this.instances.splice(
            this.instances.findIndex(
                (i) =>
                    i.instanceId === key.instanceId &&
                    i.appName === key.appName,
            ),
            1,
        );
    }

    async getBySdkName(sdkName: string): Promise<IClientInstance[]> {
        return this.instances.filter((instance) =>
            instance.sdkVersion?.startsWith(sdkName),
        );
    }

    async groupApplicationsBySdk(): Promise<
        { sdkVersion: string; applications: string[] }[]
    > {
        return Object.entries(groupBy(this.instances, 'sdkVersion')).map(
            ([sdkVersion, apps]) => ({
                sdkVersion,
                applications: apps.map((item) => item.appName),
            }),
        );
    }

    async groupApplicationsBySdkAndProject(
        _projectId: string,
    ): Promise<{ sdkVersion: string; applications: string[] }[]> {
        throw new Error('Not implemented in mock');
    }

    async deleteAll(): Promise<void> {
        this.instances = [];
    }

    async deleteForApplication(appName: string): Promise<void> {
        this.instances = this.instances.filter((i) => i.appName !== appName);
    }

    destroy(): void {}

    async exists(
        key: Pick<INewClientInstance, 'appName' | 'instanceId'>,
    ): Promise<boolean> {
        return this.instances.some(
            (i) => i.appName === key.appName && i.instanceId === key.instanceId,
        );
    }

    async get(
        key: Pick<INewClientInstance, 'appName' | 'instanceId'>,
    ): Promise<IClientInstance> {
        const instance = this.instances.find(
            (i) => i.appName === key.appName && i.instanceId === key.instanceId,
        );
        if (instance) {
            return instance;
        }
        throw new NotFoundError(`Could not find instance with key: ${key}`);
    }

    async getAll(): Promise<IClientInstance[]> {
        return this.instances;
    }

    async getByAppName(appName: string): Promise<IClientInstance[]> {
        return this.instances.filter((i) => i.appName === appName);
    }

    async getRecentByAppNameAndEnvironment(
        appName: string,
        environment: string,
    ): Promise<IClientInstance[]> {
        return this.instances
            .filter((i) => i.appName === appName)
            .filter((i) => i.environment === environment);
    }

    async getDistinctApplications(): Promise<string[]> {
        const apps = new Set<string>();
        this.instances.forEach((i) => {
            apps.add(i.appName);
        });
        return Array.from(apps.values());
    }

    async getDistinctApplicationsCount(): Promise<number> {
        const apps = await this.getDistinctApplications();
        return apps.length;
    }

    async upsert(details: INewClientInstance): Promise<void> {
        this.instances.push({ createdAt: new Date(), ...details });
    }

    removeOldInstances(): Promise<void> {
        return Promise.resolve(undefined);
    }
}
