import type { IClientInstance } from '../../../types/stores/client-instance-store';
import type { ApplicationOverviewSchema } from '../../../openapi/spec/application-overview-schema';
import type { ApplicationOverviewEnvironmentSchema } from '../../../openapi/spec/application-overview-environment-schema';

export interface IYesNoCount {
    yes: number;
    no: number;
}

export interface IAppInstance {
    appName: string;
    instanceId: string;
    sdkVersion: string;
    clientIp: string;
    lastSeen: Date;
    createdAt: Date;
}

export interface IApplication {
    appName: string;
    sdkVersion?: string;
    strategies?: string[] | any[];
    description?: string;
    url?: string;
    color?: string;
    icon?: string;
    createdAt?: Date;
    instances?: IClientInstance[];
    seenToggles?: Record<string, any>;
    project?: string;
    projects?: string[];
    environment?: string;
    links?: Record<string, string>;
}

export type IApplicationOverviewEnvironment = Omit<
    ApplicationOverviewEnvironmentSchema,
    'lastSeen'
> & {
    lastSeen: Date;
};

export type IApplicationOverview = Omit<
    ApplicationOverviewSchema,
    'environments'
> & {
    environments: IApplicationOverviewEnvironment[];
};
