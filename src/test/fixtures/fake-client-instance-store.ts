import {
    IClientInstance,
    IClientInstanceStore,
    INewClientInstance,
} from '../../lib/types/stores/client-instance-store';
import NotFoundError from '../../lib/error/notfound-error';

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

    setLastSeen(): Promise<void> {
        return;
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

    async getDistinctApplications(): Promise<string[]> {
        const apps = new Set<string>();
        this.instances.forEach((i) => apps.add(i.appName));
        return Array.from(apps.values());
    }

    async insert(details: INewClientInstance): Promise<void> {
        this.instances.push({ createdAt: new Date(), ...details });
    }
}
