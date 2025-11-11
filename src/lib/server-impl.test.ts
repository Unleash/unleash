import type { RequestHandler } from 'express';
import { createTestConfig } from '../test/config/test-config.js';
import {
    create,
    type Db,
    type IUnleashConfig,
    type IUnleashOptions,
    type IUnleashServices,
    type IUnleashStores,
    start,
    type UnleashFactoryMethods,
} from './server-impl.js';
import { vi } from 'vitest';
import type MetricsMonitor from './metrics.js';

const mockFactories: () => UnleashFactoryMethods = () => ({
    createDb: vi.fn<(config: IUnleashConfig) => Db>().mockReturnValue({
        destroy: vi.fn(),
    } as unknown as Db),
    createStores: vi
        .fn<(config: IUnleashConfig, db: Db) => IUnleashStores>()
        .mockReturnValue({
            settingStore: {
                get: vi.fn(),
                postgresVersion: vi.fn(),
            },
            eventStore: {
                on: vi.fn(),
            },
        } as unknown as IUnleashStores),
    createServices: vi
        .fn<
            (
                stores: IUnleashStores,
                config: IUnleashConfig,
                db: Db,
            ) => IUnleashServices
        >()
        .mockReturnValue({
            userService: {
                initAdminUser: vi.fn(),
            },
            schedulerService: {
                schedule: vi.fn(),
                stop: vi.fn(),
            },
            addonService: {
                destroy: vi.fn(),
            },
            openApiService: {
                // returns a middleware
                validPath: vi.fn().mockReturnValue(() => {}),
                initializeOpenApi: vi.fn(),
            },
        } as unknown as IUnleashServices),
    createSessionDb:
        vi.fn<(config: IUnleashConfig, db: Db) => RequestHandler>(),
    createMetricsMonitor: vi.fn<() => MetricsMonitor>().mockReturnValue({
        startMonitoring: vi.fn(),
    } as unknown as MetricsMonitor),
});

const configWithoutMigrations = (opts?: IUnleashOptions) => {
    const config = createTestConfig({
        server: { port: 0 },
        ...opts,
    });
    config.db = {
        ...config.db,
        disableMigration: true,
    };
    config.enableOAS = false;
    return config;
};
test('should call preHook', async () => {
    let called = 0;
    const config = configWithoutMigrations({
        preHook: () => {
            called++;
        },
    });

    const { stop } = await start(config, mockFactories());
    expect(called).toBe(1);
    await stop();
});

test('should call preRouterHook', async () => {
    let called = 0;
    const { stop } = await start(
        configWithoutMigrations({
            preRouterHook: () => {
                called++;
            },
        }),
        mockFactories(),
    );
    expect(called === 1).toBe(true);
    await stop();
});

test('should auto-create server on start()', async () => {
    const { server, stop } = await start(
        configWithoutMigrations(),
        mockFactories(),
    );
    expect(typeof server === 'undefined').toBe(false);
    await stop();
});

test('should not create a server using create()', async () => {
    const config = configWithoutMigrations();
    const { server, stop } = await create(config, mockFactories());
    expect(server).toBeUndefined();
    await stop();
});

test('should shutdown the server when calling stop()', async () => {
    const { server, stop } = await start(
        configWithoutMigrations(),
        mockFactories(),
    );
    await stop();
    expect(server?.address()).toBe(null);
});
