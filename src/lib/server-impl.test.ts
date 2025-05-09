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
import { jest } from '@jest/globals';
import type MetricsMonitor from './metrics.js';

const mockFactories: () => UnleashFactoryMethods = () => ({
    createDb: jest.fn<(config: IUnleashConfig) => Db>().mockReturnValue({
        destroy: jest.fn(),
    } as unknown as Db),
    createStores: jest
        .fn<(config: IUnleashConfig, db: Db) => IUnleashStores>()
        .mockReturnValue({
            settingStore: {
                get: jest.fn(),
                postgresVersion: jest.fn(),
            },
            eventStore: {
                on: jest.fn(),
            },
        } as unknown as IUnleashStores),
    createServices: jest
        .fn<
            (
                stores: IUnleashStores,
                config: IUnleashConfig,
                db: Db,
            ) => IUnleashServices
        >()
        .mockReturnValue({
            userService: {
                initAdminUser: jest.fn(),
            },
            schedulerService: {
                schedule: jest.fn(),
                stop: jest.fn(),
            },
            addonService: {
                destroy: jest.fn(),
            },
            openApiService: {
                // returns a middleware
                validPath: jest.fn().mockReturnValue(() => {}),
            },
        } as unknown as IUnleashServices),
    createSessionDb:
        jest.fn<(config: IUnleashConfig, db: Db) => RequestHandler>(),
    createMetricsMonitor: jest.fn<() => MetricsMonitor>().mockReturnValue({
        startMonitoring: jest.fn(),
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
