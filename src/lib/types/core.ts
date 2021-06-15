import { Request } from 'express';
import EventEmitter from 'events';
import * as https from 'https';
import * as http from 'http';
import User from './user';
import { IUnleashConfig } from './option';
import { IUnleashStores } from './stores';
import { IUnleashServices } from './services';

export interface AuthedRequest extends Request {
    user: User;
}

export interface IUnleash {
    app: any;
    config: IUnleashConfig;
    eventBus: EventEmitter;
    stores: IUnleashStores;
    server?: http.Server | https.Server;
    services: IUnleashServices;
    stop: () => Promise<void>;
    version: string;
}
