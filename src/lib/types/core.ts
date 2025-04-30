import type { Request } from 'express';
import type EventEmitter from 'events';
import type * as https from 'https';
import type * as http from 'http';
import type User from './user.js';
import type { IAuditUser, IUser } from './user.js';
import type { IUnleashConfig } from './option.js';
import type { IUnleashStores } from './stores.js';
import type { IUnleashServices } from '../services/index.js';

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

export const SYSTEM_USER_AUDIT: IAuditUser = {
    id: SYSTEM_USER.id,
    username: SYSTEM_USER.username!,
    ip: '',
};

export const TEST_AUDIT_USER: IAuditUser = {
    id: -9999,
    username: 'test@example.com',
    ip: '999.999.999.999',
};

export const SYSTEM_USER_ID: number = SYSTEM_USER.id;
