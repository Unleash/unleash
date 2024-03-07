import { parse } from 'pg-connection-string';
import merge from 'deepmerge';
import * as fs from 'fs';
import {
    IUnleashOptions,
    IUnleashConfig,
    IDBOption,
    ISessionOption,
    IServerOption,
    IVersionOption,
    IAuthOption,
    IAuthType,
    IImportOption,
    IEmailOption,
    IListeningPipe,
    IListeningHost,
    IUIConfig,
    ICspDomainConfig,
    ICspDomainOptions,
    IClientCachingOption,
    IMetricsRateLimiting,
    IRateLimiting,
} from './types/option';
import { getDefaultLogProvider, LogLevel, validateLogProvider } from './logger';
import { defaultCustomAuthDenyAll } from './default-custom-auth-deny-all';
import { formatBaseUri } from './util/format-base-uri';
import {
    hoursToMilliseconds,
    minutesToMilliseconds,
    secondsToMilliseconds,
} from 'date-fns';
import EventEmitter from 'events';
import {
    ApiTokenType,
    mapLegacyToken,
    validateApiToken,
} from './types/models/api-token';
import {
    parseEnvVarBoolean,
    parseEnvVarNumber,
    parseEnvVarStrings,
} from './util/parseEnvVar';
import {
    defaultExperimentalOptions,
    IExperimentalOptions,
} from './types/experimental';
import {
    DEFAULT_SEGMENT_VALUES_LIMIT,
    DEFAULT_STRATEGY_SEGMENTS_LIMIT,
} from './util/segments';
import FlagResolver from './util/flag-resolver';
import { validateOrigins } from './util/validateOrigin';
import { ResourceLimitsSchema } from './openapi/spec/resource-limits-schema';

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

const defaultDbOptions: WithOptional<IDBOption, 'user' | 'password' | 'host'> =
    {
        user: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        host: process.env.DATABASE_HOST,
        port: parseEnvVarNumber(process.env.DATABASE_PORT, 5432),
        database: process.env.DATABASE_NAME || 'unleash',
        ssl:
            process.env.DATABASE_SSL != null
                ? JSON.parse(process.env.DATABASE_SSL)
                : { rejectUnauthorized: false },
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
        disableMigration: false,
        applicationName: process.env.DATABASE_APPLICATION_NAME || 'unleash',
    };

const defaultSessionOption: ISessionOption = {
    ttlHours: parseEnvVarNumber(process.env.SESSION_TTL_HOURS, 48),
    clearSiteDataOnLogout: parseEnvVarBoolean(
        process.env.SESSION_CLEAR_SITE_DATA_ON_LOGOUT,
        true,
    ),
    cookieName: 'unleash-session',
    db: true,
};

const defaultServerOption: IServerOption = {
    pipe: undefined,
    host: process.env.HTTP_HOST,
    port: parseEnvVarNumber(process.env.HTTP_PORT || process.env.PORT, 4242),
    baseUriPath: formatBaseUri(process.env.BASE_URI_PATH),
    cdnPrefix: process.env.CDN_PREFIX,
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
};

const defaultVersionOption: IVersionOption = {
    url: process.env.UNLEASH_VERSION_URL || 'https://version.unleash.run',
    enable: parseEnvVarBoolean(process.env.CHECK_VERSION, true),
};

const defaultAuthentication: IAuthOption = {
    enableApiToken: parseEnvVarBoolean(process.env.AUTH_ENABLE_API_TOKEN, true),
    type: authTypeFromString(process.env.AUTH_TYPE),
    customAuthHandler: defaultCustomAuthDenyAll,
    createAdminUser: true,
    initialAdminUser: {
        username: process.env.UNLEASH_DEFAULT_ADMIN_USERNAME ?? 'admin',
        password: process.env.UNLEASH_DEFAULT_ADMIN_PASSWORD ?? 'unleash4all',
    },
    initApiTokens: [],
};

const defaultImport: WithOptional<IImportOption, 'file'> = {
    file: process.env.IMPORT_FILE,
    dropBeforeImport: parseEnvVarBoolean(
        process.env.IMPORT_DROP_BEFORE_IMPORT,
        false,
    ),
    keepExisting: parseEnvVarBoolean(process.env.IMPORT_KEEP_EXISTING, false),
};

const defaultEmail: IEmailOption = {
    host: process.env.EMAIL_HOST,
    secure: parseEnvVarBoolean(process.env.EMAIL_SECURE, false),
    port: parseEnvVarNumber(process.env.EMAIL_PORT, 587),
    sender: process.env.EMAIL_SENDER || 'Unleash <noreply@getunleash.io>',
    smtpuser: process.env.EMAIL_USER,
    smtppass: process.env.EMAIL_PASSWORD,
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
            project,
            environment,
            secret,
            type: tokenType,
            tokenName: 'admin',
        };
        validateApiToken(mapLegacyToken(token));
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
            process.env.INIT_CLIENT_API_TOKENS,
            ApiTokenType.CLIENT,
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

export function createConfig(options: IUnleashOptions): IUnleashConfig {
    let extraDbOptions = {};

    if (options.databaseUrl) {
        extraDbOptions = parse(options.databaseUrl);
    } else if (process.env.DATABASE_URL) {
        extraDbOptions = parse(process.env.DATABASE_URL);
    }
    let fileDbOptions = {};
    if (options.databaseUrlFile && fs.existsSync(options.databaseUrlFile)) {
        fileDbOptions = parse(
            fs.readFileSync(options.databaseUrlFile, 'utf-8'),
        );
    } else if (
        process.env.DATABASE_URL_FILE &&
        fs.existsSync(process.env.DATABASE_URL_FILE)
    ) {
        fileDbOptions = parse(
            fs.readFileSync(process.env.DATABASE_URL_FILE, 'utf-8'),
        );
    }
    const db: IDBOption = mergeAll<IDBOption>([
        defaultDbOptions,
        dbPort(extraDbOptions),
        dbPort(fileDbOptions),
        options.db || {},
    ]);

    const session: ISessionOption = mergeAll([
        defaultSessionOption,
        options.session || {},
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
        defaultAuthentication,
        (options.authentication
            ? removeUndefinedKeys(options.authentication)
            : options.authentication) || {},
        { initApiTokens: initApiTokens },
    ]);

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

    const enableOAS = parseEnvVarBoolean(process.env.ENABLE_OAS, true);

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

    const metricsRateLimiting = loadMetricsRateLimitingConfig(options);

    const rateLimiting = loadRateLimitingConfig(options);

    const feedbackUriPath = process.env.FEEDBACK_URI_PATH;

    const dailyMetricsStorageDays = Math.min(
        parseEnvVarNumber(process.env.DAILY_METRICS_STORAGE_DAYS, 31),
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
    };

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
        publicFolder: options.publicFolder,
        disableScheduler: options.disableScheduler,
        isEnterprise: isEnterprise,
        metricsRateLimiting,
        rateLimiting,
        feedbackUriPath,
        dailyMetricsStorageDays,
    };
}

module.exports = {
    createConfig,
    authTypeFromString,
};
