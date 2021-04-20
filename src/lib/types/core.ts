import { Request } from 'express';
import { LogProvider } from '../logger';
import { IEmailOptions } from '../services/email-service';
import ProjectStore from '../db/project-store';
import EventStore from '../db/event-store';
import FeatureTypeStore from '../db/feature-type-store';
import User from '../user';
import StrategyStore from '../db/strategy-store';

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
    strategyStore: StrategyStore;
}

export enum AuthenticationType {
    none = 'none',
    unsecure = 'unsecure', // deprecated. Remove in v4
    custom = 'custom',
    openSource = 'open-source',
    enterprise = 'enterprise',
}

export interface AuthedRequest extends Request {
    user: User;
}
