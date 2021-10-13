// @ts-nocheck
import { createConfig } from './create-config';

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

test('should enabled metricsV2 via options', async () => {
    const config = createConfig({
        experimental: {
            metricsV2: { enabled: true },
        },
    });

    expect(config.experimental.metricsV2.enabled).toBe(true);
});

test('should enabled metricsV2 via env variable', async () => {
    process.env.EXP_METRICS_V2 = 'true';
    const config = createConfig({});

    expect(config.experimental.metricsV2.enabled).toBe(true);
    delete process.env.EXP_METRICS_V2;
});

test('should enabled metricsV2 when environments is enabled via env variable', async () => {
    process.env.EXP_ENVIRONMENTS = 'true';
    const config = createConfig({});

    expect(config.experimental.environments.enabled).toBe(true);
    expect(config.experimental.metricsV2.enabled).toBe(true);
    delete process.env.EXP_ENVIRONMENTS;
});

test('should enabled metricsV2 when environments is enabled via options', async () => {
    const config = createConfig({
        experimental: {
            environments: { enabled: true },
        },
    });

    expect(config.experimental.environments.enabled).toBe(true);
    expect(config.experimental.metricsV2.enabled).toBe(true);
});

test('should set UI flag when environments is enabled', async () => {
    process.env.EXP_ENVIRONMENTS = 'true';
    const config = createConfig({});

    expect(config.experimental.environments.enabled).toBe(true);
    expect(config.ui.flags?.E).toBe(true);
    delete process.env.EXP_ENVIRONMENTS;
});
