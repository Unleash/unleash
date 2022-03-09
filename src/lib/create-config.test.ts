import { createConfig } from './create-config';
import { ApiTokenType } from './types/models/api-token';

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

    expect(config).toMatchSnapshot();
});

test('should add initApiToken for admin token from options', async () => {
    const token = {
        environment: '*',
        project: '*',
        secret: '*:*.some-random-string',
        type: ApiTokenType.ADMIN,
        username: 'admin',
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
    expect(config.authentication.initApiTokens[0].project).toBe(token.project);
    expect(config.authentication.initApiTokens[0].type).toBe(
        ApiTokenType.ADMIN,
    );
});

test('should add initApiToken for client token from options', async () => {
    const token = {
        environment: 'development',
        project: 'default',
        secret: 'default:development.some-random-string',
        type: ApiTokenType.CLIENT,
        username: 'admin',
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
    expect(config.authentication.initApiTokens[0].project).toBe(token.project);
    expect(config.authentication.initApiTokens[0].type).toBe(
        ApiTokenType.CLIENT,
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
    expect(config.authentication.initApiTokens[0].project).toBe('*');
    expect(config.authentication.initApiTokens[0].type).toBe(
        ApiTokenType.ADMIN,
    );
    expect(config.authentication.initApiTokens[1].secret).toBe(
        '*:*.some-token2',
    );

    delete process.env.INIT_ADMIN_API_TOKENS;
});

test('should validate initApiToken for admin token from env var', async () => {
    process.env.INIT_ADMIN_API_TOKENS = 'invalidProject:*:some-token1';

    expect(() => createConfig({})).toThrow(
        'Admin token cannot be scoped to single project',
    );

    delete process.env.INIT_ADMIN_API_TOKENS;
});

test('should validate initApiToken for client token from env var', async () => {
    process.env.INIT_CLIENT_API_TOKENS = '*:*:some-token1';

    expect(() => createConfig({})).toThrow(
        'Client token cannot be scoped to all environments',
    );

    delete process.env.INIT_CLIENT_API_TOKENS;
});

test('should merge initApiToken from options and env vars', async () => {
    process.env.INIT_ADMIN_API_TOKENS = '*:*.some-token1, *:*.some-token2';
    process.env.INIT_CLIENT_API_TOKENS = 'default:development.some-token1';
    const token = {
        environment: '*',
        project: '*',
        secret: '*:*.some-random-string',
        type: ApiTokenType.ADMIN,
        username: 'admin',
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
    delete process.env.INIT_CLIENT_API_TOKENS;
    delete process.env.INIT_ADMIN_API_TOKENS;
});

test('should add initApiToken for client token from env var', async () => {
    process.env.INIT_CLIENT_API_TOKENS =
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
    expect(config.authentication.initApiTokens[0].project).toBe('default');
    expect(config.authentication.initApiTokens[0].type).toBe(
        ApiTokenType.CLIENT,
    );
    expect(config.authentication.initApiTokens[0].secret).toBe(
        'default:development.some-token1',
    );

    delete process.env.INIT_CLIENT_API_TOKENS;
});

test('should handle cases where no env var specified for tokens', async () => {
    const token = {
        environment: '*',
        project: '*',
        secret: '*:*.some-random-string',
        type: ApiTokenType.ADMIN,
        username: 'admin',
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
