import EventEmitter from 'events';
import { LogLevel, LogProvider } from '../logger';
import { ILegacyApiTokenCreate } from './models/api-token';
import { IFlagResolver, IExperimentalOptions, IFlags } from './experimental';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

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
    acquireConnectionTimeout?: number;
    pool?: {
        min?: number;
        max?: number;
        idleTimeoutMillis?: number;
        propagateCreateError?: boolean;
        afterCreate?: (connection: any, callback: any) => void;
    };
    schema: string;
    disableMigration: boolean;
    applicationName?: string;
}

export interface ISessionOption {
    ttlHours: number;
    db: boolean;
    clearSiteDataOnLogout: boolean;
    cookieName: string;
}

export interface IVersionOption {
    url?: string;
    enable?: boolean;
}
export enum IAuthType {
    OPEN_SOURCE = 'open-source',
    DEMO = 'demo',
    ENTERPRISE = 'enterprise',
    HOSTED = 'hosted',
    CUSTOM = 'custom',
    NONE = 'none',
}

export interface IAuthOption {
    enableApiToken: boolean;
    type: IAuthType;
    customAuthHandler?: Function;
    createAdminUser: boolean;
    initApiTokens: ILegacyApiTokenCreate[];
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
    cdnPrefix?: string;
    unleashUrl: string;
    serverMetrics: boolean;
    enableHeapSnapshotEnpoint: boolean;
    enableRequestLogger: boolean;
    gracefulShutdownEnable: boolean;
    gracefulShutdownTimeout: number;
    secret: string;
}

export interface IClientCachingOption {
    enabled: boolean;
    maxAge: number;
}

export interface IUnleashOptions {
    databaseUrl?: string;
    databaseUrlFile?: string;
    db?: Partial<IDBOption>;
    session?: Partial<ISessionOption>;
    getLogger?: LogProvider;
    logLevel?: LogLevel;
    server?: Partial<IServerOption>;
    versionCheck?: Partial<IVersionOption>;
    telemetry?: boolean;
    authentication?: Partial<IAuthOption>;
    ui?: object;
    frontendApi?: IFrontendApi;
    import?: Partial<IImportOption>;
    experimental?: Partial<IExperimentalOptions>;
    email?: Partial<IEmailOption>;
    secureHeaders?: boolean;
    additionalCspAllowedDomains?: ICspDomainOptions;
    frontendApiOrigins?: string[];
    enableOAS?: boolean;
    preHook?: Function;
    preRouterHook?: Function;
    enterpriseVersion?: string;
    inlineSegmentConstraints?: boolean;
    clientFeatureCaching?: Partial<IClientCachingOption>;
    flagResolver?: IFlagResolver;
    accessControlMaxAge?: number;
    prometheusApi?: string;
    publicFolder?: string;
}

export interface IEmailOption {
    host?: string;
    secure: boolean;
    port: number;
    sender: string;
    smtpuser?: string;
    smtppass?: string;
    transportOptions?: SMTPTransport.Options;
}

export interface IListeningPipe {
    path: string;
}

export interface IListeningHost {
    host?: string;
    port: number;
}

export interface IUIConfig {
    environment?: string;
    slogan?: string;
    name?: string;
    links?: [
        {
            value: string;
            icon?: string;
            href: string;
            title: string;
        },
    ];
    flags?: IFlags;
}

export interface ICspDomainOptions {
    defaultSrc?: string[];
    fontSrc?: string[];
    styleSrc?: string[];
    scriptSrc?: string[];
    imgSrc?: string[];
    connectSrc?: string[];
}

export interface ICspDomainConfig {
    defaultSrc: string[];
    fontSrc: string[];
    styleSrc: string[];
    scriptSrc: string[];
    imgSrc: string[];
    connectSrc: string[];
}

interface IFrontendApi {
    refreshIntervalInMs: number;
}

export interface IUnleashConfig {
    db: IDBOption;
    session: ISessionOption;
    getLogger: LogProvider;
    server: IServerOption;
    listen: IListeningHost | IListeningPipe;
    versionCheck: IVersionOption;
    telemetry: boolean;
    authentication: IAuthOption;
    ui: IUIConfig;
    import: IImportOption;
    experimental?: IExperimentalOptions;
    flagResolver: IFlagResolver;
    email: IEmailOption;
    secureHeaders: boolean;
    additionalCspAllowedDomains: ICspDomainConfig;
    frontendApiOrigins: string[];
    enableOAS: boolean;
    preHook?: Function;
    preRouterHook?: Function;
    enterpriseVersion?: string;
    eventBus: EventEmitter;
    environmentEnableOverrides?: string[];
    frontendApi: IFrontendApi;
    inlineSegmentConstraints: boolean;
    segmentValuesLimit: number;
    strategySegmentsLimit: number;
    clientFeatureCaching: IClientCachingOption;
    accessControlMaxAge: number;
    prometheusApi?: string;
    publicFolder?: string;
}
