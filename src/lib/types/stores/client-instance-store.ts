import { Store } from './store';

export interface IClientInstance extends INewClientInstance {
    createdAt: Date;
}

export interface INewClientInstance {
    appName: string;
    instanceId: string;
    sdkVersion?: string;
    clientIp?: string;
    lastSeen?: Date;
    environment?: string;
}
export interface IClientInstanceStore
    extends Store<
        IClientInstance,
        Pick<INewClientInstance, 'appName' | 'instanceId'>
    > {
    bulkUpsert(instances: INewClientInstance[]): Promise<void>;
    setLastSeen(INewClientInstance): Promise<void>;
    insert(details: INewClientInstance): Promise<void>;
    getByAppName(appName: string): Promise<IClientInstance[]>;
    getDistinctApplications(): Promise<string[]>;
    deleteForApplication(appName: string): Promise<void>;
}
