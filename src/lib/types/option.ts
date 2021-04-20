import { LogProvider } from '../logger';
import { IEmailOptions } from '../services/email-service';

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
}

export interface IVersionOption {
    url?: string;
    enable?: boolean;
}

export interface IAuthOption {
    enableApiToken: boolean;
    type: 'open-source' | 'demo' | 'enterprise' | 'custom';
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
    email?: Partial<IEmailOptions>;
    secureHeaders?: boolean;
    enableOAS?: boolean;
}

export interface IUnleashConfig {
    db: IDBOption;
    session: ISessionOption;
    getLogger: LogProvider;
    server: IServerOption;
    versionCheck: IVersionOption;
    authentication: IAuthOption;
    ui: object;
    import: IImportOption;
    experimental: {
        [key: string]: object;
    };
    email: IEmailOptions;
    secureHeaders: boolean;
    enableOAS: boolean;
};
