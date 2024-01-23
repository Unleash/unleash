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

export const SYSTEM_USER: Omit<IUser, 'email'> = {
    id: -1337,
    imageUrl: '',
    isAPI: false,
    name: 'Unleash System',
    permissions: [],
    username: 'unleash_system_user',
};

export const ADMIN_TOKEN_USER: Omit<IUser, 'email'> = {
    id: -42,
    imageUrl: '',
    isAPI: true,
    name: 'Unleash Admin Token',
    permissions: [],
    username: 'unleash_admin_token',
};

export const SYSTEM_USER_ID: number = SYSTEM_USER.id;
