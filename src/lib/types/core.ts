import { LogProvider } from '../logger';
import { IEmailOptions } from '../services/email-service';

interface IExperimentalFlags {
    [key: string]: boolean;
}

export interface IUnleashConfig {
    getLogger: LogProvider;
    baseUriPath: string;
    experimental?: IExperimentalFlags;
    authentication: {
        enableApiToken: boolean;
        createAdminUser: boolean;
    };
    unleashUrl: string;
    email?: IEmailOptions;
}

export enum AuthenticationType {
    none = 'none',
    unsecure = 'unsecure', // deprecated. Remove in v4
    custom = 'custom',
    openSource = 'open-source',
    enterprise = 'enterprise',
}
