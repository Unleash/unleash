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

test('should add initApiToken from options', async () => {
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

test('should add initApiToken from env var', async () => {
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

test('should validate initApiToken from env var', async () => {
    process.env.INIT_ADMIN_API_TOKENS = 'invalidProject:*:some-token1';

    expect(() => createConfig({})).toThrow(
        'Admin token cannot be scoped to single project',
    );

    delete process.env.INIT_ADMIN_API_TOKENS;
});

test('should merge initApiToken from options and env vars', async () => {
    process.env.INIT_ADMIN_API_TOKENS = '*:*.some-token1, *:*.some-token2';
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

    expect(config.authentication.initApiTokens).toHaveLength(3);
    delete process.env.INIT_ADMIN_API_TOKENS;
});
