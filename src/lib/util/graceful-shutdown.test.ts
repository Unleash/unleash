import { createTestConfig } from '../../test/config/test-config';

describe('Graceful shutdown hooks', () => {
    test('Shutdown hooks can be registered', async () => {
        const config = createTestConfig({});
        let wasCalled = false;
        config.gracefulShutdownRegistry.registerGracefulShutdownHook(
            'test-shutdown',
            async () => {
                wasCalled = true;
            },
        );
        await config.gracefulShutdownRegistry.executeShutdownHooks();
        expect(wasCalled).toBeTruthy();
    });
    test('Registering hook with same name as existing hook, should throw error', async () => {
        const config = createTestConfig({});
        let wasCalled = false;
        config.gracefulShutdownRegistry.registerGracefulShutdownHook(
            'test-shutdown',
            async () => {
                wasCalled = true;
            },
        );
        expect(() =>
            config.gracefulShutdownRegistry.registerGracefulShutdownHook(
                'test-shutdown',
                async () => {
                    wasCalled = true;
                },
            ),
        ).toThrowErrorMatchingSnapshot('duplicate-shutdown-hook');
    });
    test('Can register multiple hooks with different names', async () => {
        const config = createTestConfig({});
        let wasCalled = false;
        let secondWasCalled = false;
        config.gracefulShutdownRegistry.registerGracefulShutdownHook(
            'hook-1',
            async () => {
                wasCalled = true;
            },
        );
        config.gracefulShutdownRegistry.registerGracefulShutdownHook(
            'hook-2',
            async () => {
                secondWasCalled = true;
            },
        );
        await config.gracefulShutdownRegistry.executeShutdownHooks();
        expect(wasCalled).toEqual(true);
        expect(secondWasCalled).toEqual(true);
    });

    test('Shutdown will wait on all hooks', async () => {
        const config = createTestConfig({});
        let wasCalled = false;
        let secondWasCalled = false;
        config.gracefulShutdownRegistry.registerGracefulShutdownHook(
            'hook-1',
            async () => {
                wasCalled = true;
            },
        );
        config.gracefulShutdownRegistry.registerGracefulShutdownHook(
            'hook-2',
            async () => {
                return new Promise((resolve) =>
                    setTimeout(() => {
                        secondWasCalled = true;
                        resolve();
                    }, 500),
                );
            },
        );
        await config.gracefulShutdownRegistry.executeShutdownHooks();
        expect(wasCalled).toEqual(true);
        expect(secondWasCalled).toEqual(true);
    });
    test('Calling executeShutdownHooks should empty the registered shutdown hooks', async () => {
        const config = createTestConfig({});
        config.gracefulShutdownRegistry.registerGracefulShutdownHook(
            'hook-1',
            async () => {},
        );
        await config.gracefulShutdownRegistry.executeShutdownHooks();
        expect(() =>
            config.gracefulShutdownRegistry.registerGracefulShutdownHook(
                'hook-1',
                async () => {},
            ),
        ).not.toThrow();
    });

    test('Can add synchronous hook', async () => {
        const config = createTestConfig({});
        let called = false;
        config.gracefulShutdownRegistry.registerGracefulShutdownHook(
            'sync',
            () => {
                called = true;
            },
        );
        await config.gracefulShutdownRegistry.executeShutdownHooks();
        expect(called).toEqual(true);
    });
});
