import { LogProvider } from '../logger';

interface IExperimentalFlags {
    [key: string]: boolean;
}

export interface IUnleashConfig {
    getLogger: LogProvider;
    baseUriPath: string;
    extendedPermissions?: boolean;
    experimental?: IExperimentalFlags;
    authentication: {
        enableApiToken: boolean;
        createAdminUser: boolean;
    };
}

export enum AuthenticationType {
    none = 'none',
    unsecure = 'unsecure', // deprecated. Remove in v4
    custom = 'custom',
    openSource = 'open-source',
    enterprise = 'enterprise',
}
