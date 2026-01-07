import type { Store } from './store.js';

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
    sdkType?: 'backend' | 'frontend' | null;
}
export interface IClientInstanceStore
    extends Store<
        IClientInstance,
        Pick<INewClientInstance, 'appName' | 'instanceId'>
    > {
    bulkUpsert(instances: INewClientInstance[]): Promise<void>;
    upsert(details: INewClientInstance): Promise<void>;
    getByAppName(appName: string): Promise<IClientInstance[]>;
    getRecentByAppNameAndEnvironment(
        appName: string,
        environment: string,
    ): Promise<IClientInstance[]>;
    getBySdkName(sdkName: string): Promise<IClientInstance[]>;
    groupApplicationsBySdk(): Promise<
        { sdkVersion: string; applications: string[] }[]
    >;
    groupApplicationsBySdkAndProject(
        projectId: string,
    ): Promise<{ sdkVersion: string; applications: string[] }[]>;
    getDistinctApplications(): Promise<string[]>;
    getDistinctApplicationsCount(daysBefore?: number): Promise<number>;
    deleteForApplication(appName: string): Promise<void>;
    removeOldInstances(): Promise<void>;
}
