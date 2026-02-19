import pgs from 'pg-connection-string';
const { parse } = pgs;
import merge from 'deepmerge';
import { readFileSync, existsSync } from 'fs';
import {
    type IAuthOption,
    IAuthType,
    type IClientCachingOption,
    type ICspDomainConfig,
    type ICspDomainOptions,
    type IDBOption,
    type IEmailOption,
    type IImportOption,
    type IListeningHost,
    type IListeningPipe,
    type IMetricsRateLimiting,
    type IRateLimiting,
    type IServerOption,
    type ISessionOption,
    type IUIConfig,
    type IUnleashConfig,
    type IUnleashOptions,
    type IVersionOption,
    type ISSLOption,
    type UsernameAdminUser,
} from './types/option.js';
import {
    getDefaultLogProvider,
    LogLevel,
    validateLogProvider,
} from './logger.js';
import { defaultCustomAuthDenyAll } from './default-custom-auth-deny-all.js';
import { formatBaseUri } from './util/format-base-uri.js';
import {
    hoursToMilliseconds,
    minutesToMilliseconds,
    secondsToMilliseconds,
} from 'date-fns';
import EventEmitter from 'events';
import { validateApiToken } from './types/models/api-token.js';
import {
    parseEnvVarBoolean,
    parseEnvVarJSON,
    parseEnvVarNumber,
    parseEnvVarStrings,
} from './util/parseEnvVar.js';
import {
    defaultExperimentalOptions,
    type IExperimentalOptions,
} from './types/experimental.js';
import {
    DEFAULT_SEGMENT_VALUES_LIMIT,
    DEFAULT_STRATEGY_SEGMENTS_LIMIT,
} from './util/segments.js';
import FlagResolver from './util/flag-resolver.js';
import { validateOrigins } from './util/validateOrigin.js';
import type { ResourceLimitsSchema } from './openapi/spec/resource-limits-schema.js';
import { ApiTokenType } from './internals.js';

const safeToUpper = (s?: string) => (s ? s.toUpperCase() : s);

type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export function authTypeFromString(
    s?: string,
    defaultType: IAuthType = IAuthType.OPEN_SOURCE,
): IAuthType {
    const upperS = safeToUpper(s);
    return upperS && IAuthType[upperS] ? IAuthType[upperS] : defaultType;
}

function mergeAll<T>(objects: Partial<T>[]): T {
    return merge.all<T>(objects.filter((i) => i));
}

function loadExperimental(options: IUnleashOptions): IExperimentalOptions {
    return {
        ...defaultExperimentalOptions,
        ...options.experimental,
        flags: {
            ...defaultExperimentalOptions.flags,
            ...options.experimental?.flags,
        },
    };
}

const defaultClientCachingOptions: IClientCachingOption = {
    enabled: true,
    maxAge: hoursToMilliseconds(1),
};

function loadClientCachingOptions(
    options: IUnleashOptions,
): IClientCachingOption {
    const envs: Partial<IClientCachingOption> = {};
    if (process.env.CLIENT_FEATURE_CACHING_MAXAGE) {
        envs.maxAge = parseEnvVarNumber(
            process.env.CLIENT_FEATURE_CACHING_MAXAGE,
            600,
        );
    }
    if (process.env.CLIENT_FEATURE_CACHING_ENABLED) {
        envs.enabled = parseEnvVarBoolean(
            process.env.CLIENT_FEATURE_CACHING_ENABLED,
            true,
        );
    }

    return mergeAll([
        defaultClientCachingOptions,
        options.clientFeatureCaching || {},
        envs,
    ]);
}

function loadMetricsRateLimitingConfig(
    options: IUnleashOptions,
): IMetricsRateLimiting {
    const clientMetricsMaxPerMinute = parseEnvVarNumber(
        process.env.REGISTER_CLIENT_RATE_LIMIT_PER_MINUTE,
        6000,
    );
    const clientRegisterMaxPerMinute = parseEnvVarNumber(
        process.env.CLIENT_METRICS_RATE_LIMIT_PER_MINUTE,
        6000,
    );
    const frontendRegisterMaxPerMinute = parseEnvVarNumber(
        process.env.REGISTER_FRONTEND_RATE_LIMIT_PER_MINUTE,
        6000,
    );
    const frontendMetricsMaxPerMinute = parseEnvVarNumber(
        process.env.FRONTEND_METRICS_RATE_LIMIT_PER_MINUTE,
        6000,
    );
    const defaultRateLimitOptions: IMetricsRateLimiting = {
        clientMetricsMaxPerMinute: clientMetricsMaxPerMinute,
        clientRegisterMaxPerMinute: clientRegisterMaxPerMinute,
        frontendRegisterMaxPerMinute: frontendRegisterMaxPerMinute,
        frontendMetricsMaxPerMinute: frontendMetricsMaxPerMinute,
    };

    return mergeAll([
        defaultRateLimitOptions,
        options.metricsRateLimiting ?? {},
    ]);
}

function loadRateLimitingConfig(options: IUnleashOptions): IRateLimiting {
    const createUserMaxPerMinute = parseEnvVarNumber(
        process.env.CREATE_USER_RATE_LIMIT_PER_MINUTE,
        20,
    );
    const simpleLoginMaxPerMinute = parseEnvVarNumber(
        process.env.SIMPLE_LOGIN_LIMIT_PER_MINUTE,
        10,
    );
    const passwordResetMaxPerMinute = parseEnvVarNumber(
        process.env.PASSWORD_RESET_LIMIT_PER_MINUTE,
        1,
    );
    const callSignalEndpointMaxPerSecond = parseEnvVarNumber(
        process.env.SIGNAL_ENDPOINT_RATE_LIMIT_PER_SECOND,
        1,
    );

    const defaultRateLimitOptions: IRateLimiting = {
        createUserMaxPerMinute,
        simpleLoginMaxPerMinute,
        passwordResetMaxPerMinute,
        callSignalEndpointMaxPerSecond,
    };
    return mergeAll([defaultRateLimitOptions, options.rateLimiting || {}]);
}

function loadUI(options: IUnleashOptions): IUIConfig {
    const uiO = options.ui || {};
    const ui: IUIConfig = {
        environment: 'Open Source',
    };

    return mergeAll([ui, uiO]);
}

const dateHandlingCallback = (connection, callback) => {
    connection.query("set datestyle to 'ISO, DMY';", (err: any) => {
        callback(err, connection);
    });
};

const readAndAddOption = (
    name: keyof ISSLOption,
    value: string | undefined,
    options: ISSLOption,
): ISSLOption =>
    value != null
        ? { ...options, [name]: readFileSync(value).toString() }
        : options;

const databaseSSL = (): IDBOption['ssl'] => {
    if (process.env.DATABASE_SSL != null) {
        return JSON.parse(process.env.DATABASE_SSL);
    }

    if (process.env.DATABASE_SSL_CA_CONFIG != null) {
        return readFileSync(
            process.env.DATABASE_SSL_CA_CONFIG,
        ).toString() as unknown as IDBOption['ssl'];
    }

    const rejectUnauthorizedDefault =
        process.env.DATABASE_SSL_CA_FILE != null ||
        process.env.DATABASE_SSL_CERT_FILE != null ||
        process.env.DATABASE_SSL_KEY_FILE != null;

    let options: ISSLOption = {
        rejectUnauthorized: parseEnvVarBoolean(
            process.env.DATABASE_SSL_REJECT_UNAUTHORIZED,
            rejectUnauthorizedDefault,
        ),
    };

    options = readAndAddOption(
        'key',
        process.env.DATABASE_SSL_KEY_FILE,
        options,
    );
    options = readAndAddOption(
        'cert',
        process.env.DATABASE_SSL_CERT_FILE,
        options,
    );
    options = readAndAddOption('ca', process.env.DATABASE_SSL_CA_FILE, options);

    return options;
};

const defaultDbOptions: WithOptional<IDBOption, 'user' | 'password' | 'host'> =
    {
        user: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        host: process.env.DATABASE_HOST,
        port: parseEnvVarNumber(process.env.DATABASE_PORT, 5432),
        database: process.env.DATABASE_NAME || 'unleash',
        ssl: databaseSSL(),
        driver: 'postgres',
        version: process.env.DATABASE_VERSION,
        acquireConnectionTimeout: secondsToMilliseconds(30),
        pool: {
            min: parseEnvVarNumber(process.env.DATABASE_POOL_MIN, 0),
            max: parseEnvVarNumber(process.env.DATABASE_POOL_MAX, 4),
            idleTimeoutMillis: parseEnvVarNumber(
                process.env.DATABASE_POOL_IDLE_TIMEOUT_MS,
                secondsToMilliseconds(30),
            ),
            ...(parseEnvVarBoolean(
                process.env.ALLOW_NON_STANDARD_DB_DATES,
                false,
            )
                ? { afterCreate: dateHandlingCallback }
                : {}),
            propagateCreateError: false,
        },
        schema: process.env.DATABASE_SCHEMA || 'public',
        disableMigration: parseEnvVarBoolean(
            process.env.DATABASE_DISABLE_MIGRATION,
            false,
        ),
        applicationName: process.env.DATABASE_APPLICATION_NAME || 'unleash',
    };

const defaultSessionOption = (isEnterprise: boolean): ISessionOption => ({
    ttlHours: parseEnvVarNumber(process.env.SESSION_TTL_HOURS, 48),
    clearSiteDataOnLogout: parseEnvVarBoolean(
        process.env.SESSION_CLEAR_SITE_DATA_ON_LOGOUT,
        true,
    ),
    cookieName: 'unleash-session',
    db: true,
    // default limit of 100 for enterprise, 5 for pro and oss
    // at least 1 session should be allowed
    maxParallelSessions: Math.max(
        parseEnvVarNumber(
            process.env.MAX_PARALLEL_SESSIONS,
            isEnterprise ? 100 : 5,
        ),
        1,
    ),
});

const defaultServerOption: IServerOption = {
    pipe: undefined,
    host: process.env.HTTP_HOST,
    port: parseEnvVarNumber(process.env.HTTP_PORT || process.env.PORT, 4242),
    baseUriPath: formatBaseUri(process.env.BASE_URI_PATH),
    cdnPrefix: process.env.CDN_PREFIX,
    edgeUrl: process.env.EDGE_URL,
    unleashUrl: process.env.UNLEASH_URL || 'http://localhost:4242',
    serverMetrics: true,
    enableHeapSnapshotEnpoint: parseEnvVarBoolean(
        process.env.ENABLE_HEAP_SNAPSHOT_ENPOINT,
        false,
    ),
    disableCompression: parseEnvVarBoolean(
        process.env.SERVER_DISABLE_COMPRESSION,
        false,
    ),
    keepAliveTimeout: secondsToMilliseconds(
        parseEnvVarNumber(process.env.SERVER_KEEPALIVE_TIMEOUT, 15),
    ),
    headersTimeout: secondsToMilliseconds(61),
    enableRequestLogger: parseEnvVarBoolean(
        process.env.REQUEST_LOGGER_ENABLE,
        false,
    ),
    gracefulShutdownEnable: parseEnvVarBoolean(
        process.env.GRACEFUL_SHUTDOWN_ENABLE,
        true,
    ),
    gracefulShutdownTimeout: parseEnvVarNumber(
        process.env.GRACEFUL_SHUTDOWN_TIMEOUT,
        secondsToMilliseconds(1),
    ),
    secret: process.env.UNLEASH_SECRET || 'super-secret',
    enableScheduledCreatedByMigration: parseEnvVarBoolean(
        process.env.ENABLE_SCHEDULED_CREATED_BY_MIGRATION,
        false,
    ),
};

const defaultVersionOption: IVersionOption = {
    url: process.env.UNLEASH_VERSION_URL || 'https://version.unleash.run',
    enable: parseEnvVarBoolean(process.env.CHECK_VERSION, true),
};

const parseEnvVarInitialAdminUser = (): UsernameAdminUser | undefined => {
    const username = process.env.UNLEASH_DEFAULT_ADMIN_USERNAME;
    const password = process.env.UNLEASH_DEFAULT_ADMIN_PASSWORD;
    return username && password ? { username, password } : undefined;
};

const buildDefaultAuthOption = () => {
    return {
        demoAllowAdminLogin: parseEnvVarBoolean(
            process.env.AUTH_DEMO_ALLOW_ADMIN_LOGIN,
            false,
        ),
        enableApiToken: parseEnvVarBoolean(
            process.env.AUTH_ENABLE_API_TOKEN,
            true,
        ),
        type: authTypeFromString(process.env.AUTH_TYPE),
        customAuthHandler: defaultCustomAuthDenyAll,
        createAdminUser: true,
        initialAdminUser: parseEnvVarInitialAdminUser(),
        initApiTokens: [],
    };
};

const defaultImport: WithOptional<IImportOption, 'file'> = {
    file: process.env.IMPORT_FILE,
    project: process.env.IMPORT_PROJECT ?? 'default',
    environment: process.env.IMPORT_ENVIRONMENT ?? 'development',
};

const defaultEmail: IEmailOption = {
    host: process.env.EMAIL_HOST,
    secure: parseEnvVarBoolean(process.env.EMAIL_SECURE, false),
    port: parseEnvVarNumber(process.env.EMAIL_PORT, 587),
    sender: process.env.EMAIL_SENDER || 'Unleash <noreply@getunleash.io>',
    smtpuser: process.env.EMAIL_USER,
    smtppass: process.env.EMAIL_PASSWORD,
    optionalHeaders: parseEnvVarJSON(process.env.EMAIL_OPTIONAL_HEADERS, {}),
};

const dbPort = (dbConfig: Partial<IDBOption>): Partial<IDBOption> => {
    if (typeof dbConfig.port === 'string') {
        dbConfig.port = Number.parseInt(dbConfig.port, 10);
    }
    return dbConfig;
};

const removeUndefinedKeys = (o: object): object =>
    Object.keys(o).reduce((a, key) => {
        if (o[key] !== undefined) {
            a[key] = o[key];
            return a;
        }
        return a;
    }, {});

const formatServerOptions = (
    serverOptions?: Partial<IServerOption>,
): Partial<IServerOption> | undefined => {
    if (!serverOptions) {
        return {
            baseUriPath: formatBaseUri(process.env.BASE_URI_PATH),
        };
    }

    return {
        ...serverOptions,
        baseUriPath: formatBaseUri(
            process.env.BASE_URI_PATH || serverOptions.baseUriPath,
        ),
    };
};

const loadTokensFromString = (
    tokenString: String | undefined,
    tokenType: ApiTokenType,
) => {
    if (!tokenString) {
        return [];
    }
    const initApiTokens = tokenString.split(/,\s?/);
    const tokens = initApiTokens.map((secret) => {
        const [project = '*', rest] = secret.split(':');
        const [environment = '*'] = rest.split('.');
        const token = {
            createdAt: undefined,
            projects: [project],
            environment,
            secret,
            type: tokenType,
            tokenName: 'admin',
        };
        validateApiToken(token);
        return token;
    });
    return tokens;
};

const loadInitApiTokens = () => {
    return [
        ...loadTokensFromString(
            process.env.INIT_ADMIN_API_TOKENS,
            ApiTokenType.ADMIN,
        ),
        ...loadTokensFromString(
            process.env.INIT_BACKEND_API_TOKENS ??
                // INIT_CLIENT_API_TOKENS is deprecated in favor of INIT_BACKEND_API_TOKENS
                process.env.INIT_CLIENT_API_TOKENS,
            ApiTokenType.BACKEND,
        ),
        ...loadTokensFromString(
            process.env.INIT_FRONTEND_API_TOKENS,
            ApiTokenType.FRONTEND,
        ),
    ];
};

const loadEnvironmentEnableOverrides = () => {
    const environmentsString = process.env.ENABLED_ENVIRONMENTS;
    if (environmentsString) {
        return environmentsString.split(',');
    }
    return [];
};

const parseCspConfig = (
    cspConfig?: ICspDomainOptions,
): ICspDomainConfig | undefined => {
    if (!cspConfig) {
        return undefined;
    }

    return {
        defaultSrc: cspConfig.defaultSrc || [],
        fontSrc: cspConfig.fontSrc || [],
        scriptSrc: cspConfig.scriptSrc || [],
        imgSrc: cspConfig.imgSrc || [],
        styleSrc: cspConfig.styleSrc || [],
        connectSrc: cspConfig.connectSrc || [],
        mediaSrc: cspConfig.mediaSrc || [],
        objectSrc: cspConfig.objectSrc || [],
        frameSrc: cspConfig.frameSrc || [],
    };
};

const parseCspEnvironmentVariables = (): ICspDomainConfig => {
    const defaultSrc = process.env.CSP_ALLOWED_DEFAULT?.split(',') || [];
    const fontSrc = process.env.CSP_ALLOWED_FONT?.split(',') || [];
    const styleSrc = process.env.CSP_ALLOWED_STYLE?.split(',') || [];
    const scriptSrc = process.env.CSP_ALLOWED_SCRIPT?.split(',') || [];
    const imgSrc = process.env.CSP_ALLOWED_IMG?.split(',') || [];
    const connectSrc = process.env.CSP_ALLOWED_CONNECT?.split(',') || [];
    const mediaSrc = process.env.CSP_ALLOWED_MEDIA?.split(',') || [];
    const objectSrc = process.env.CSP_ALLOWED_OBJECT?.split(',') || [];
    const frameSrc = process.env.CSP_ALLOWED_FRAME?.split(',') || [];

    return {
        defaultSrc,
        fontSrc,
        styleSrc,
        scriptSrc,
        imgSrc,
        connectSrc,
        mediaSrc,
        objectSrc,
        frameSrc,
    };
};

const parseFrontendApiOrigins = (options: IUnleashOptions): string[] => {
    const frontendApiOrigins = parseEnvVarStrings(
        process.env.UNLEASH_FRONTEND_API_ORIGINS,
        options.frontendApiOrigins || ['*'],
    );

    const error = validateOrigins(frontendApiOrigins);
    if (error) {
        throw new Error(error);
    }

    return frontendApiOrigins;
};

export function resolveIsOss(
    isEnterprise: boolean,
    isOssOption?: boolean,
    uiEnvironment?: string,
    testEnvironmentActive: boolean = false,
): boolean {
    return testEnvironmentActive
        ? (isOssOption ?? false)
        : !isEnterprise && uiEnvironment?.toLowerCase() !== 'pro';
}

export function createConfig(options: IUnleashOptions): IUnleashConfig {
    let extraDbOptions = {};

    if (options.databaseUrl) {
        extraDbOptions = parse(options.databaseUrl);
    } else if (process.env.DATABASE_URL) {
        extraDbOptions = parse(process.env.DATABASE_URL);
    }
    let fileDbOptions = {};
    if (options.databaseUrlFile && existsSync(options.databaseUrlFile)) {
        fileDbOptions = parse(readFileSync(options.databaseUrlFile, 'utf-8'));
    } else if (
        process.env.DATABASE_URL_FILE &&
        existsSync(process.env.DATABASE_URL_FILE)
    ) {
        fileDbOptions = parse(
            readFileSync(process.env.DATABASE_URL_FILE, 'utf-8'),
        );
    }
    const db: IDBOption = mergeAll<IDBOption>([
        defaultDbOptions,
        dbPort(extraDbOptions),
        dbPort(fileDbOptions),
        options.db || {},
    ]);

    const logLevel =
        options.logLevel || LogLevel[process.env.LOG_LEVEL ?? LogLevel.error];
    const getLogger = options.getLogger || getDefaultLogProvider(logLevel);
    validateLogProvider(getLogger);

    const server: IServerOption = mergeAll([
        defaultServerOption,
        formatServerOptions(options.server) || {},
    ]);

    const versionCheck: IVersionOption = mergeAll([
        defaultVersionOption,
        options.versionCheck || {},
    ]);

    const telemetry: boolean =
        options.telemetry ||
        parseEnvVarBoolean(process.env.SEND_TELEMETRY, true);
    const initApiTokens = loadInitApiTokens();

    const authentication: IAuthOption = mergeAll([
        buildDefaultAuthOption(),
        (options.authentication
            ? removeUndefinedKeys(options.authentication)
            : options.authentication) || {},
        { initApiTokens: initApiTokens },
    ]);
    // make sure init tokens appear only once
    authentication.initApiTokens = [
        ...new Map(
            authentication.initApiTokens.map((token) => [token.secret, token]),
        ).values(),
    ];

    const customStrategySettings = options.customStrategySettings ?? {
        disableCreation: parseEnvVarBoolean(
            process.env.UNLEASH_DISABLE_CUSTOM_STRATEGY_CREATION,
            false,
        ),

        disableEditing: parseEnvVarBoolean(
            process.env.UNLEASH_DISABLE_CUSTOM_STRATEGY_EDITING,
            false,
        ),
    };

    const environmentEnableOverrides = loadEnvironmentEnableOverrides();

    const importSetting: IImportOption = mergeAll([
        defaultImport,
        options.import || {},
    ]);

    const experimental = loadExperimental(options);
    const flagResolver = new FlagResolver(experimental);

    const ui = loadUI(options);

    const email: IEmailOption = mergeAll([defaultEmail, options.email || {}]);

    let listen: IListeningPipe | IListeningHost;
    if (server.pipe) {
        listen = { path: server.pipe };
    } else {
        listen = { host: server.host || undefined, port: server.port ?? 4242 };
    }

    const frontendApi = options.frontendApi || {
        refreshIntervalInMs: parseEnvVarNumber(
            process.env.FRONTEND_API_REFRESH_INTERVAL_MS,
            minutesToMilliseconds(45),
        ),
    };

    const secureHeaders =
        options.secureHeaders ||
        parseEnvVarBoolean(process.env.SECURE_HEADERS, false);

    const enableOAS =
        options.enableOAS === undefined
            ? parseEnvVarBoolean(process.env.ENABLE_OAS, true)
            : options.enableOAS;

    const additionalCspAllowedDomains: ICspDomainConfig =
        parseCspConfig(options.additionalCspAllowedDomains) ||
        parseCspEnvironmentVariables();

    const inlineSegmentConstraints =
        typeof options.inlineSegmentConstraints === 'boolean'
            ? options.inlineSegmentConstraints
            : true;

    const segmentValuesLimit = parseEnvVarNumber(
        process.env.UNLEASH_SEGMENT_VALUES_LIMIT,
        DEFAULT_SEGMENT_VALUES_LIMIT,
    );

    const strategySegmentsLimit = parseEnvVarNumber(
        process.env.UNLEASH_STRATEGY_SEGMENTS_LIMIT,
        DEFAULT_STRATEGY_SEGMENTS_LIMIT,
    );

    const accessControlMaxAge = options.accessControlMaxAge
        ? options.accessControlMaxAge
        : parseEnvVarNumber(process.env.ACCESS_CONTROL_MAX_AGE, 86400);

    const clientFeatureCaching = loadClientCachingOptions(options);

    const prometheusApi = options.prometheusApi || process.env.PROMETHEUS_API;

    const isEnterprise =
        Boolean(options.enterpriseVersion) &&
        ui.environment?.toLowerCase() !== 'pro';

    const isTest = process.env.NODE_ENV === 'test';
    const isOss = resolveIsOss(
        isEnterprise,
        options.isOss,
        ui.environment,
        isTest,
    );

    const session: ISessionOption = mergeAll([
        defaultSessionOption(isEnterprise),
        options.session || {},
    ]);

    const metricsRateLimiting = loadMetricsRateLimitingConfig(options);

    const rateLimiting = loadRateLimitingConfig(options);

    const feedbackUriPath = process.env.FEEDBACK_URI_PATH;

    const dailyMetricsStorageDays = Math.min(
        parseEnvVarNumber(process.env.DAILY_METRICS_STORAGE_DAYS, 91),
        91,
    );

    const resourceLimits: ResourceLimitsSchema = {
        segmentValues: segmentValuesLimit,
        strategySegments: strategySegmentsLimit,
        signalEndpoints: parseEnvVarNumber(
            process.env.UNLEASH_SIGNAL_ENDPOINTS_LIMIT,
            5,
        ),
        actionSetActions: parseEnvVarNumber(
            process.env.UNLEASH_ACTION_SET_ACTIONS_LIMIT,
            10,
        ),
        actionSetsPerProject: parseEnvVarNumber(
            process.env.UNLEASH_ACTION_SETS_PER_PROJECT_LIMIT,
            5,
        ),
        actionSetFilters: parseEnvVarNumber(
            process.env.UNLEASH_ACTION_SET_FILTERS_LIMIT,
            5,
        ),
        actionSetFilterValues: parseEnvVarNumber(
            process.env.UNLEASH_ACTION_SET_FILTER_VALUES_LIMIT,
            25,
        ),
        signalTokensPerEndpoint: parseEnvVarNumber(
            process.env.UNLEASH_SIGNAL_TOKENS_PER_ENDPOINT_LIMIT,
            5,
        ),
        featureEnvironmentStrategies: Math.max(
            1,
            parseEnvVarNumber(
                process.env.UNLEASH_FEATURE_ENVIRONMENT_STRATEGIES_LIMIT,
                options?.resourceLimits?.featureEnvironmentStrategies ?? 30,
            ),
        ),
        constraintValues: Math.max(
            1,
            parseEnvVarNumber(
                process.env.UNLEASH_CONSTRAINT_VALUES_LIMIT,
                options?.resourceLimits?.constraintValues ?? 250,
            ),
        ),
        constraints: Math.max(
            0,
            parseEnvVarNumber(
                process.env.UNLEASH_CONSTRAINTS_LIMIT,
                options?.resourceLimits?.constraints ?? 30,
            ),
        ),
        environments: Math.max(
            1,
            parseEnvVarNumber(
                process.env.UNLEASH_ENVIRONMENTS_LIMIT,
                options?.resourceLimits?.environments ?? 50,
            ),
        ),
        projects: Math.max(
            1,
            parseEnvVarNumber(
                process.env.UNLEASH_PROJECTS_LIMIT,
                options?.resourceLimits?.projects ?? 500,
            ),
        ),
        apiTokens: Math.max(
            0,
            parseEnvVarNumber(
                process.env.UNLEASH_API_TOKENS_LIMIT,
                options?.resourceLimits?.apiTokens ?? 2000,
            ),
        ),
        segments: Math.max(
            0,
            parseEnvVarNumber(
                process.env.UNLEASH_SEGMENTS_LIMIT,
                options?.resourceLimits?.segments ?? 300,
            ),
        ),
        featureFlags: Math.max(
            1,
            parseEnvVarNumber(
                process.env.UNLEASH_FEATURE_FLAGS_LIMIT,
                options?.resourceLimits?.featureFlags ?? 5000,
            ),
        ),
        releaseTemplates: Math.max(
            0,
            parseEnvVarNumber(
                process.env.UNLEASH_RELEASE_TEMPLATES_LIMIT,
                options?.resourceLimits?.releaseTemplates ?? 10,
            ),
        ),
    };

    const openAIAPIKey = process.env.OPENAI_API_KEY;

    const unleashFrontendToken =
        options.unleashFrontendToken || process.env.UNLEASH_FRONTEND_TOKEN;

    const defaultDaysToBeConsideredInactive = 180;
    const userInactivityThresholdInDays =
        options.userInactivityThresholdInDays ??
        parseEnvVarNumber(
            process.env.USER_INACTIVITY_THRESHOLD_IN_DAYS,
            defaultDaysToBeConsideredInactive,
        );

    const prometheusImpactMetricsApi =
        options.prometheusImpactMetricsApi ||
        process.env.PROMETHEUS_IMPACT_METRICS_API;

    const checkDbOnReady =
        Boolean(options.checkDbOnReady) ??
        parseEnvVarBoolean(process.env.CHECK_DB_ON_READY, false);
    const edgeMasterKey = options.edgeMasterKey ?? process.env.EDGE_MASTER_KEY;

    const edgeClientSecret =
        options.edgeClientSecret ?? process.env.EDGE_CLIENT_SECRET;
    return {
        db,
        session,
        getLogger,
        server,
        listen,
        versionCheck,
        telemetry,
        authentication,
        ui,
        import: importSetting,
        experimental,
        flagResolver,
        frontendApi,
        email,
        secureHeaders,
        enableOAS,
        preHook: options.preHook,
        preRouterHook: options.preRouterHook,
        enterpriseVersion: options.enterpriseVersion,
        eventBus: new EventEmitter(),
        environmentEnableOverrides,
        additionalCspAllowedDomains,
        frontendApiOrigins: parseFrontendApiOrigins(options),
        inlineSegmentConstraints,
        segmentValuesLimit,
        strategySegmentsLimit,
        resourceLimits,
        clientFeatureCaching,
        accessControlMaxAge,
        prometheusApi,
        prometheusImpactMetricsApi,
        publicFolder: options.publicFolder,
        disableScheduler: options.disableScheduler,
        isEnterprise: isEnterprise,
        isOss: isOss,
        metricsRateLimiting,
        rateLimiting,
        feedbackUriPath,
        dailyMetricsStorageDays,
        openAIAPIKey,
        userInactivityThresholdInDays,
        buildDate: process.env.BUILD_DATE,
        unleashFrontendToken,
        customStrategySettings,
        checkDbOnReady,
        edgeMasterKey,
        edgeClientSecret,
    };
}
