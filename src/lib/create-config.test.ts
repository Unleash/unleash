import { createConfig, resolveIsOss } from './create-config.js';
import { ApiTokenType } from './types/model.js';

beforeEach(() => {
    delete process.env.INIT_BACKEND_API_TOKENS;
    delete process.env.INIT_ADMIN_API_TOKENS;
    delete process.env.INIT_CLIENT_API_TOKENS;
    delete process.env.ENABLED_ENVIRONMENTS;
});
test('should create default config', async () => {
    const config = createConfig({
        db: {
            host: 'localhost',
            port: 4242,
            user: 'unleash',
            password: 'password',
            database: 'unleash_db',
        },
        server: {
            port: 4242,
        },
    });

    const { experimental, flagResolver, ...configWithoutExperimental } = config;
    expect(configWithoutExperimental).toMatchSnapshot();
    expect(flagResolver).toMatchObject({
        getAll: expect.any(Function),
        isEnabled: expect.any(Function),
        getVariant: expect.any(Function),
    });
});

test('should add initApiToken for admin token from options', async () => {
    const token = {
        environment: '*',
        projects: ['*'],
        secret: '*:*.some-random-string',
        type: ApiTokenType.ADMIN,
        tokenName: 'admin',
    };
    const config = createConfig({
        db: {
            host: 'localhost',
            port: 4242,
            user: 'unleash',
            password: 'password',
            database: 'unleash_db',
        },
        server: {
            port: 4242,
        },
        authentication: {
            initApiTokens: [token],
        },
    });

    expect(config.authentication.initApiTokens).toHaveLength(1);
    expect(config.authentication.initApiTokens[0].environment).toBe(
        token.environment,
    );
    expect(config.authentication.initApiTokens[0].projects).toMatchObject(
        token.projects,
    );
    expect(config.authentication.initApiTokens[0].type).toBe(
        ApiTokenType.ADMIN,
    );
});

test('should add initApiToken for client token from options', async () => {
    const token = {
        environment: 'development',
        projects: ['default'],
        secret: 'default:development.some-random-string',
        type: ApiTokenType.BACKEND,
        tokenName: 'admin',
    };
    const config = createConfig({
        db: {
            host: 'localhost',
            port: 4242,
            user: 'unleash',
            password: 'password',
            database: 'unleash_db',
        },
        server: {
            port: 4242,
        },
        authentication: {
            initApiTokens: [token],
        },
    });

    expect(config.authentication.initApiTokens).toHaveLength(1);
    expect(config.authentication.initApiTokens[0].environment).toBe(
        token.environment,
    );
    expect(config.authentication.initApiTokens[0].projects).toMatchObject(
        token.projects,
    );
    expect(config.authentication.initApiTokens[0].type).toBe(
        ApiTokenType.BACKEND,
    );
});

test('should add initApiToken for admin token from env var', async () => {
    process.env.INIT_ADMIN_API_TOKENS = '*:*.some-token1, *:*.some-token2';

    const config = createConfig({
        db: {
            host: 'localhost',
            port: 4242,
            user: 'unleash',
            password: 'password',
            database: 'unleash_db',
        },
        server: {
            port: 4242,
        },
    });

    expect(config.authentication.initApiTokens).toHaveLength(2);
    expect(config.authentication.initApiTokens[0].environment).toBe('*');
    expect(config.authentication.initApiTokens[0].projects).toMatchObject([
        '*',
    ]);
    expect(config.authentication.initApiTokens[0].type).toBe(
        ApiTokenType.ADMIN,
    );
    expect(config.authentication.initApiTokens[1].secret).toBe(
        '*:*.some-token2',
    );
});

test('should validate initApiToken for admin token from env var', async () => {
    process.env.INIT_ADMIN_API_TOKENS = 'invalidProject:*:some-token1';

    expect(() => createConfig({})).toThrow(
        'Admin token cannot be scoped to single project',
    );
});

test('should validate initApiToken for client token from env var', async () => {
    process.env.INIT_BACKEND_API_TOKENS = '*:*:some-token1';

    expect(() => createConfig({})).toThrow(
        'Client token cannot be scoped to all environments',
    );
});

test('should merge initApiToken from options and env vars', async () => {
    process.env.INIT_ADMIN_API_TOKENS = '*:*.some-token1, *:*.some-token2';
    process.env.INIT_BACKEND_API_TOKENS = 'default:development.some-token1';
    const token = {
        environment: '*',
        projects: ['*'],
        secret: '*:*.some-random-string',
        type: ApiTokenType.ADMIN,
        tokenName: 'admin',
    };
    const config = createConfig({
        db: {
            host: 'localhost',
            port: 4242,
            user: 'unleash',
            password: 'password',
            database: 'unleash_db',
        },
        server: {
            port: 4242,
        },
        authentication: {
            initApiTokens: [token],
        },
    });

    expect(config.authentication.initApiTokens).toHaveLength(4);
});

test.each([
    ApiTokenType.BACKEND,
    ApiTokenType.CLIENT,
])('should add initApiToken for %s token from env var', async (tokenType) => {
    process.env[`INIT_${tokenType.toUpperCase()}_API_TOKENS`] =
        'default:development.some-token1, default:development.some-token2';

    const config = createConfig({
        db: {
            host: 'localhost',
            port: 4242,
            user: 'unleash',
            password: 'password',
            database: 'unleash_db',
        },
        server: {
            port: 4242,
        },
    });

    expect(config.authentication.initApiTokens).toHaveLength(2);
    expect(config.authentication.initApiTokens[0].environment).toBe(
        'development',
    );
    expect(config.authentication.initApiTokens[0].projects).toMatchObject([
        'default',
    ]);
    expect(config.authentication.initApiTokens[0].type).toBe(
        ApiTokenType.BACKEND,
    );
    expect(config.authentication.initApiTokens[0].secret).toBe(
        'default:development.some-token1',
    );
});

test('should handle cases where no env var specified for tokens', async () => {
    const token = {
        environment: '*',
        projects: ['*'],
        secret: '*:*.some-random-string',
        type: ApiTokenType.ADMIN,
        tokenName: 'admin',
    };
    const config = createConfig({
        db: {
            host: 'localhost',
            port: 4242,
            user: 'unleash',
            password: 'password',
            database: 'unleash_db',
        },
        server: {
            port: 4242,
        },
        authentication: {
            initApiTokens: [token],
        },
    });

    expect(config.authentication.initApiTokens).toHaveLength(1);
});

test('should default demo admin login to false', async () => {
    const config = createConfig({});
    expect(config.authentication.demoAllowAdminLogin).toBeFalsy();
});

test('should load environment overrides from env var', async () => {
    process.env.ENABLED_ENVIRONMENTS = 'default,production';

    const config = createConfig({
        db: {
            host: 'localhost',
            port: 4242,
            user: 'unleash',
            password: 'password',
            database: 'unleash_db',
        },
        server: {
            port: 4242,
        },
        authentication: {
            initApiTokens: [],
        },
    });

    expect(config.environmentEnableOverrides).toHaveLength(2);
    expect(config.environmentEnableOverrides).toContain('production');
});

test('should yield an empty list when no environment overrides are specified', async () => {
    const config = createConfig({
        db: {
            host: 'localhost',
            port: 4242,
            user: 'unleash',
            password: 'password',
            database: 'unleash_db',
        },
        server: {
            port: 4242,
        },
        authentication: {
            initApiTokens: [],
        },
    });

    expect(config.environmentEnableOverrides).toStrictEqual([]);
});

test('should yield all empty lists when no additionalCspAllowedDomains are set', async () => {
    const config = createConfig({});
    expect(config.additionalCspAllowedDomains).toBeDefined();
    expect(config.additionalCspAllowedDomains.defaultSrc).toStrictEqual([]);
    expect(config.additionalCspAllowedDomains.fontSrc).toStrictEqual([]);
    expect(config.additionalCspAllowedDomains.styleSrc).toStrictEqual([]);
    expect(config.additionalCspAllowedDomains.scriptSrc).toStrictEqual([]);
    expect(config.additionalCspAllowedDomains.imgSrc).toStrictEqual([]);
    expect(config.additionalCspAllowedDomains.connectSrc).toStrictEqual([]);
});

test('If additionalCspAllowedDomains is set in config map, passes through', async () => {
    const config = createConfig({
        additionalCspAllowedDomains: {
            defaultSrc: ['googlefonts.com'],
            fontSrc: [],
            styleSrc: [],
            scriptSrc: [],
            imgSrc: [],
            connectSrc: [],
        },
    });
    expect(config.additionalCspAllowedDomains).toBeDefined();
    expect(config.additionalCspAllowedDomains.defaultSrc).toStrictEqual([
        'googlefonts.com',
    ]);
    expect(config.additionalCspAllowedDomains.fontSrc).toStrictEqual([]);
    expect(config.additionalCspAllowedDomains.styleSrc).toStrictEqual([]);
    expect(config.additionalCspAllowedDomains.scriptSrc).toStrictEqual([]);
    expect(config.additionalCspAllowedDomains.imgSrc).toStrictEqual([]);
    expect(config.additionalCspAllowedDomains.connectSrc).toStrictEqual([]);
});

test('Can set partial additionalCspDomains', () => {
    const config = createConfig({
        additionalCspAllowedDomains: {
            defaultSrc: ['googlefonts.com'],
        },
    });
    expect(config.additionalCspAllowedDomains).toBeDefined();
    expect(config.additionalCspAllowedDomains.defaultSrc).toStrictEqual([
        'googlefonts.com',
    ]);
    expect(config.additionalCspAllowedDomains.fontSrc).toStrictEqual([]);
    expect(config.additionalCspAllowedDomains.styleSrc).toStrictEqual([]);
    expect(config.additionalCspAllowedDomains.scriptSrc).toStrictEqual([]);
    expect(config.additionalCspAllowedDomains.imgSrc).toStrictEqual([]);
});

test.each([
    ['CSP_ALLOWED_DEFAULT', 'googlefonts.com', 'defaultSrc'],
    ['CSP_ALLOWED_FONT', 'googlefonts.com', 'fontSrc'],
    ['CSP_ALLOWED_STYLE', 'googlefonts.com', 'styleSrc'],
    ['CSP_ALLOWED_SCRIPT', 'googlefonts.com', 'scriptSrc'],
    ['CSP_ALLOWED_IMG', 'googlefonts.com', 'imgSrc'],
    ['CSP_ALLOWED_CONNECT', 'googlefonts.com', 'connectSrc'],
])('When %s is set to %s. %s should include passed in domain', (env, domain, key) => {
    process.env[env] = domain;
    const config = createConfig({});
    expect(config.additionalCspAllowedDomains[key][0]).toBe(domain);
    Object.keys(config.additionalCspAllowedDomains)
        .filter((objKey) => objKey !== key)
        .forEach((otherKey) => {
            expect(config.additionalCspAllowedDomains[otherKey]).toStrictEqual(
                [],
            );
        });
    delete process.env[env];
});

test('When multiple CSP environment variables are set, respects them all', () => {
    process.env.CSP_ALLOWED_DEFAULT = 'googlefonts.com';
    process.env.CSP_ALLOWED_IMG = 'googlefonts.com';
    process.env.CSP_ALLOWED_SCRIPT = 'plausible.getunleash.io';
    process.env.CSP_ALLOWED_CONNECT = 'plausible.getunleash.io';
    const config = createConfig({});
    expect(config.additionalCspAllowedDomains.imgSrc).toStrictEqual([
        'googlefonts.com',
    ]);
    expect(config.additionalCspAllowedDomains.defaultSrc).toStrictEqual([
        'googlefonts.com',
    ]);
    expect(config.additionalCspAllowedDomains.scriptSrc).toStrictEqual([
        'plausible.getunleash.io',
    ]);
    expect(config.additionalCspAllowedDomains.connectSrc).toStrictEqual([
        'plausible.getunleash.io',
    ]);
    delete process.env.CSP_ALLOWED_DEFAULT;
    delete process.env.CSP_ALLOWED_IMG;
    delete process.env.CSP_ALLOWED_SCRIPT;
    delete process.env.CSP_ALLOWED_CONNECT;
});

test('Supports multiple domains comma separated in environment variables', () => {
    process.env.CSP_ALLOWED_SCRIPT = 'plausible.getunleash.io,googlefonts.com';
    const config = createConfig({});
    expect(config.additionalCspAllowedDomains.scriptSrc).toStrictEqual([
        'plausible.getunleash.io',
        'googlefonts.com',
    ]);
});

test('Should enable client feature caching with .6 seconds max age by default', () => {
    const config = createConfig({});
    expect(config.clientFeatureCaching.enabled).toBe(true);
    expect(config.clientFeatureCaching.maxAge).toBe(3600000);
});

test('Should use overrides from options for client feature caching', () => {
    const config = createConfig({
        clientFeatureCaching: {
            enabled: false,
            maxAge: 120,
        },
    });
    expect(config.clientFeatureCaching.enabled).toBe(false);
    expect(config.clientFeatureCaching.maxAge).toBe(120);
});

test('Should be able to set client features caching using environment variables', () => {
    process.env.CLIENT_FEATURE_CACHING_ENABLED = 'false';
    process.env.CLIENT_FEATURE_CACHING_MAXAGE = '120';
    const config = createConfig({});
    expect(config.clientFeatureCaching.enabled).toBe(false);
    expect(config.clientFeatureCaching.maxAge).toBe(120);
    delete process.env.CLIENT_FEATURE_CACHING_ENABLED;
    delete process.env.CLIENT_FEATURE_CACHING_MAXAGE;
});

test('Environment variables for client features caching takes priority over options', () => {
    process.env.CLIENT_FEATURE_CACHING_MAXAGE = '120';
    const config = createConfig({
        clientFeatureCaching: {
            maxAge: 180,
        },
    });
    expect(config.clientFeatureCaching.enabled).toBe(true);
    expect(config.clientFeatureCaching.maxAge).toBe(120);
});

test('Environment variables for frontend CORS origins takes priority over options', async () => {
    const create = (frontendApiOrigins?): string[] => {
        return createConfig({
            frontendApiOrigins,
        }).frontendApiOrigins;
    };

    expect(create()).toEqual(['*']);
    expect(create([])).toEqual([]);
    expect(create(['*'])).toEqual(['*']);
    expect(create(['https://example.com'])).toEqual(['https://example.com']);
    expect(() => create(['a'])).toThrow('Invalid origin: a');

    process.env.UNLEASH_FRONTEND_API_ORIGINS = '';
    expect(create()).toEqual([]);
    process.env.UNLEASH_FRONTEND_API_ORIGINS = '*';
    expect(create()).toEqual(['*']);
    process.env.UNLEASH_FRONTEND_API_ORIGINS = 'https://example.com, *';
    expect(create()).toEqual(['https://example.com', '*']);
    process.env.UNLEASH_FRONTEND_API_ORIGINS = 'b';
    expect(() => create(['a'])).toThrow('Invalid origin: b');
    delete process.env.UNLEASH_FRONTEND_API_ORIGINS;
    expect(create()).toEqual(['*']);
});

test('baseUriPath defaults to the empty string', async () => {
    const config = createConfig({});
    expect(config.server.baseUriPath).toBe('');
});
test('BASE_URI_PATH defined in env is passed through', async () => {
    process.env.BASE_URI_PATH = '/demo';
    const config = createConfig({});
    expect(config.server.baseUriPath).toBe('/demo');
    delete process.env.BASE_URI_PATH;
});

test('environment variable takes precedence over configured variable', async () => {
    process.env.BASE_URI_PATH = '/demo';
    const config = createConfig({
        server: {
            baseUriPath: '/other',
        },
    });
    expect(config.server.baseUriPath).toBe('/demo');
    delete process.env.BASE_URI_PATH;
});

test.each([
    'demo',
    '/demo',
    '/demo/',
])('Trailing and leading slashes gets normalized for base path %s', async (path) => {
    const config = createConfig({
        server: {
            baseUriPath: path,
        },
    });
    expect(config.server.baseUriPath).toBe('/demo');
});

test('Config with enterpriseVersion set and pro environment should set isEnterprise to false', async () => {
    const config = createConfig({
        enterpriseVersion: '5.3.0',
        ui: { environment: 'pro' },
    });
    expect(config.isEnterprise).toBe(false);
});

test('Config with enterpriseVersion set and not pro environment should set isEnterprise to true', async () => {
    const config = createConfig({
        enterpriseVersion: '5.3.0',
        ui: { environment: 'Enterprise' },
    });
    expect(config.isEnterprise).toBe(true);
});

test('create config should be idempotent in terms of tokens', async () => {
    // two admin tokens
    process.env.INIT_ADMIN_API_TOKENS = '*:*.some-token1, *:*.some-token2';
    process.env.INIT_BACKEND_API_TOKENS = 'default:development.some-token1';
    process.env.INIT_FRONTEND_API_TOKENS = 'frontend:development.some-token1';
    const token = {
        environment: '*',
        projects: ['*'],
        secret: '*:*.some-random-string',
        type: ApiTokenType.ADMIN,
        tokenName: 'admin',
    };
    const config = createConfig({
        db: {
            host: 'localhost',
            port: 4242,
            user: 'unleash',
            password: 'password',
            database: 'unleash_db',
        },
        server: {
            port: 4242,
        },
        authentication: {
            initApiTokens: [token],
        },
    });
    expect(config.authentication.initApiTokens.length).toStrictEqual(
        createConfig(config).authentication.initApiTokens.length,
    );
    expect(config.authentication.initApiTokens).toHaveLength(5);
});

describe('isOSS', () => {
    test('Config with pro environment should set isOss to false regardless of pro casing', async () => {
        const isOss = resolveIsOss(false, false, 'Pro');
        expect(isOss).toBe(false);
        const lowerCase = resolveIsOss(false, false, 'pro');
        expect(lowerCase).toBe(false);
        const strangeCase = resolveIsOss(false, false, 'PrO');
        expect(strangeCase).toBe(false);
    });
    test('Config with enterpriseVersion set should set isOss to false', async () => {
        const isOss = resolveIsOss(true, false, 'Enterprise');
        expect(isOss).toBe(false);
    });
    test('Config with no enterprise version and any other environment than pro should have isOss as true', async () => {
        const isOss = resolveIsOss(false, false, 'my oss environment');
        expect(isOss).toBe(true);
    });
    test('Config with enterprise false and isOss option set to false should return false in test mode', async () => {
        const isOss = resolveIsOss(false, false, 'my environment', true);
        expect(isOss).toBe(false);
    });
    test('Config with isOss option set to true should return true when test environment is active', async () => {
        let isOss = resolveIsOss(false, true, 'Pro', true);
        expect(isOss).toBe(true);

        isOss = resolveIsOss(true, true, 'Pro', true);
        expect(isOss).toBe(true);

        isOss = resolveIsOss(false, true, 'some environment', true);
        expect(isOss).toBe(true);
    });
});
