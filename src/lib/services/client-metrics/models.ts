import { IClientInstance } from '../../types/stores/client-instance-store';

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
    links?: Record<string, string>;
}
