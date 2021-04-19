import { LogProvider } from '../logger';
import { IEmailOptions } from '../services/email-service';
import ProjectStore from '../db/project-store';
import EventStore from '../db/event-store';
import FeatureTypeStore from '../db/feature-type-store';

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
    stores?: IUnleashStores;
}

export interface IUnleashStores {
    projectStore: ProjectStore;
    eventStore: EventStore;
    featureTypeStore: FeatureTypeStore;
}

export enum AuthenticationType {
    none = 'none',
    unsecure = 'unsecure', // deprecated. Remove in v4
    custom = 'custom',
    openSource = 'open-source',
    enterprise = 'enterprise',
}
