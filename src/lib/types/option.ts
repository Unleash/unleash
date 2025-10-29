import type { Express } from 'express';
import type EventEmitter from 'events';
import type { LogLevel, LogProvider } from '../logger.js';
import type { IApiTokenCreate } from './model.js';
import type {
    IExperimentalOptions,
    IFlagContext,
    IFlagResolver,
    IFlags,
} from './experimental.js';
import type SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';
import type { IUnleashServices } from '../services/index.js';

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
    maxParallelSessions: number;
}

export interface IVersionOption {
    url?: string;
    enable?: boolean;
}
export enum IAuthType {
    OPEN_SOURCE = 'open-source',
    DEMO = 'demo',
    /**
     * Self-hosted by the customer. Should eventually be renamed to better reflect this.
     */
    ENTERPRISE = 'enterprise',
    /**
     * Hosted by Unleash.
     */
    HOSTED = 'hosted',
    CUSTOM = 'custom',
    NONE = 'none',
}

export type CustomAuthHandler = (
    app: Express,
    config: Partial<IUnleashConfig>,
    services?: IUnleashServices,
) => void;

export type UsernameAdminUser = {
    username: string;
    password: string;
};

export interface IAuthOption {
    demoAllowAdminLogin?: boolean;
    enableApiToken: boolean;
    type: IAuthType;
    customAuthHandler?: CustomAuthHandler;
    createAdminUser?: boolean;
    initialAdminUser?: UsernameAdminUser;
    initApiTokens: IApiTokenCreate[];
}

export interface IImportOption {
    file: string;
    project: string;
    environment: string;
}

export interface IServerOption {
    port?: number;
    host?: string;
    pipe?: string;
    disableCompression?: boolean;
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
    enableScheduledCreatedByMigration: boolean;
}

export interface IClientCachingOption {
    enabled: boolean;
    maxAge: number;
}

export interface ICustomStrategySettings {
    disableCreation: boolean;
    disableEditing: boolean;
}

export interface ResourceLimits {
    apiTokens: number;
    constraints: number;
    constraintValues: number;
    environments: number;
    featureFlags: number;
    featureEnvironmentStrategies: number;
    projects: number;
    segments: number;
    segmentValues: number;
    strategySegments: number;
    actionSetActions: number;
    actionSetsPerProject: number;
    actionSetFilters: number;
    actionSetFilterValues: number;
    signalEndpoints: number;
    signalTokensPerEndpoint: number;
    releaseTemplates: number;
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
    ui?: IUIConfig;
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
    accessControlMaxAge?: number;
    prometheusApi?: string;
    prometheusImpactMetricsApi?: string;
    publicFolder?: string;
    disableScheduler?: boolean;
    metricsRateLimiting?: Partial<IMetricsRateLimiting>;
    dailyMetricsStorageDays?: number;
    rateLimiting?: Partial<IRateLimiting>;
    isOss?: boolean;
    resourceLimits?: Partial<ResourceLimits>;
    userInactivityThresholdInDays?: number;
    unleashFrontendToken?: string;
    customStrategySettings?: Partial<ICustomStrategySettings>;
}

export interface IEmailOption {
    host?: string;
    secure: boolean;
    port: number;
    sender: string;
    smtpuser?: string;
    smtppass?: string;
    transportOptions?: SMTPTransport.Options;
    optionalHeaders?: Record<string, unknown>;
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
    links?: {
        value: string;
        icon?: string;
        href: string;
        title: string;
    }[];
    flags?: IFlags;
    unleashToken?: string;
    unleashContext?: IFlagContext;
}

export interface ICspDomainOptions {
    defaultSrc?: string[];
    fontSrc?: string[];
    styleSrc?: string[];
    scriptSrc?: string[];
    imgSrc?: string[];
    connectSrc?: string[];
    frameSrc?: string[];
    objectSrc?: string[];
    mediaSrc?: string[];
}

export interface ICspDomainConfig {
    defaultSrc: string[];
    fontSrc: string[];
    styleSrc: string[];
    scriptSrc: string[];
    imgSrc: string[];
    connectSrc: string[];
    frameSrc: string[];
    objectSrc: string[];
    mediaSrc: string[];
}

interface IFrontendApi {
    refreshIntervalInMs: number;
}

export interface IMetricsRateLimiting {
    clientMetricsMaxPerMinute: number;
    clientRegisterMaxPerMinute: number;
    frontendMetricsMaxPerMinute: number;
    frontendRegisterMaxPerMinute: number;
}

export interface IRateLimiting {
    createUserMaxPerMinute: number;
    simpleLoginMaxPerMinute: number;
    passwordResetMaxPerMinute: number;
    callSignalEndpointMaxPerSecond: number;
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
    shutdownHook?: Function;
    enterpriseVersion?: string;
    eventBus: EventEmitter;
    environmentEnableOverrides?: string[];
    frontendApi: IFrontendApi;
    inlineSegmentConstraints: boolean;
    /** @deprecated: use resourceLimits.segmentValues */
    segmentValuesLimit: number;
    /** @deprecated: use resourceLimits.strategySegments */
    strategySegmentsLimit: number;
    resourceLimits: ResourceLimits;
    metricsRateLimiting: IMetricsRateLimiting;
    dailyMetricsStorageDays: number;
    clientFeatureCaching: IClientCachingOption;
    accessControlMaxAge: number;
    prometheusApi?: string;
    prometheusImpactMetricsApi?: string;
    publicFolder?: string;
    disableScheduler?: boolean;
    isEnterprise: boolean;
    isOss: boolean;
    rateLimiting: IRateLimiting;
    feedbackUriPath?: string;
    openAIAPIKey?: string;
    userInactivityThresholdInDays: number;
    buildDate?: string;
    unleashFrontendToken?: string;
    customStrategySettings: ICustomStrategySettings;
}
