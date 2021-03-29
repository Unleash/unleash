import { LogProvider } from '../logger';

export interface IUnleashConfig {
    getLogger: LogProvider;
    authentication: {
        enableApiToken: boolean;
    };
}

export enum AuthenticationType {
    none = 'none',
    unsecure = 'unsecure', // deprecated. Remove in v4
    custom = 'custom',
    openSource = 'open-source',
    enterprise = 'enterprise',
}
