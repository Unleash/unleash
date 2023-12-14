import { Request } from 'express';
import EventEmitter from 'events';
import * as https from 'https';
import * as http from 'http';
import User, { IUser } from './user';
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

export const SYSTEM_USER: IUser = {
    email: 'systemuser@getunleash.io',
    id: -1337,
    imageUrl: '',
    isAPI: false,
    name: 'Used by unleash internally for performing system actions that have no user',
    permissions: [],
    username: 'unleash_system_user',
};
export const SYSTEM_USER_ID: number = SYSTEM_USER.id;
