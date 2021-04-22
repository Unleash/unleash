import { LogProvider } from '../logger';

export interface ISSLOption {
    rejectUnauthorized: boolean;
    ca?: string;
    key?: string;
    cert?: string;
}

export interface IDBOption {
    user: string;
    password: string;
    host: string;
    port: number;
    database: string;
    ssl?: ISSLOption | boolean;
    driver: 'postgres';
    version?: string;
    pool?: {
        min?: number;
        max?: number;
        idleTimeoutMillis?: number;
    };
    schema: string;
    disableMigration: boolean;
}

export interface ISessionOption {
    ttlHours: number;
    db: boolean;
}

export interface IVersionOption {
    url?: string;
    enable?: boolean;
}
export enum IAuthType {
    OPEN_SOURCE = 'open-source',
    DEMO = 'demo',
    ENTERPRISE = 'enterprise',
    CUSTOM = 'custom',
    NONE = 'none',
}

export function authTypeFromString(
    s?: string,
    defaultType: IAuthType = IAuthType.OPEN_SOURCE,
): IAuthType {
    return s ? IAuthType[s.toUpperCase()] || defaultType : defaultType;
}
export interface IAuthOption {
    enableApiToken: boolean;
    type: IAuthType;
    customAuthHandler?: Function;
    createAdminUser: boolean;
}

export interface IImportOption {
    file: string;
    keepExisting: boolean;
    dropBeforeImport: boolean;
}

export interface IServerOption {
    port?: number;
    host?: string;
    pipe?: string;
    keepAliveTimeout: number;
    headersTimeout: number;
    baseUriPath: string;
    unleashUrl: string;
    serverMetrics: boolean;
    enableRequestLogger: boolean;
    secret: string;
}

export interface IUnleashOptions {
    databaseUrl?: string;
    db?: Partial<IDBOption>;
    session?: Partial<ISessionOption>;
    getLogger?: LogProvider;
    server?: Partial<IServerOption>;
    versionCheck?: Partial<IVersionOption>;
    authentication?: Partial<IAuthOption>;
    ui?: object;
    import?: Partial<IImportOption>;
    experimental?: {
        [key: string]: object;
    };
    email?: Partial<IEmailOption>;
    secureHeaders?: boolean;
    enableOAS?: boolean;
    preHook?: Function;
    preRouterHook?: Function;
    eventHook?: Function;
}

export interface IEmailOption {
    host?: string;
    secure: boolean;
    port: number;
    sender: string;
    smtpuser?: string;
    smtppass?: string;
}

export interface IListeningPipe {
    path: string;
}
export interface IListeningHost {
    host?: string;
    port: number;
}

export interface IUnleashConfig {
    db: IDBOption;
    session: ISessionOption;
    getLogger: LogProvider;
    server: IServerOption;
    listen: IListeningHost | IListeningPipe;
    versionCheck: IVersionOption;
    authentication: IAuthOption;
    ui: object;
    import: IImportOption;
    experimental: {
        [key: string]: object;
    };
    email: IEmailOption;
    secureHeaders: boolean;
    enableOAS: boolean;
    preHook?: Function;
    preRouterHook?: Function;
    eventHook?: Function;
}
