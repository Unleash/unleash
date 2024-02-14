import {
    executeShutdownHooks,
    registerGracefulShutdownHook,
} from './graceful-shutdown';
import { createTestConfig } from '../../test/config/test-config';

describe('Graceful shutdown hooks', () => {
    test('Shutdown hooks can be registered', async () => {
        const config = createTestConfig({});
        let wasCalled = false;
        registerGracefulShutdownHook(
            config.getLogger('shutdown-hook'),
            'test-shutdown',
            async () => {
                wasCalled = true;
            },
        );
        await executeShutdownHooks(config.getLogger('hook-executer'));
        expect(wasCalled).toBeTruthy();
    });
    test('Registering hook with same name as existing hook, should throw error', async () => {
        const config = createTestConfig({});
        let wasCalled = false;
        registerGracefulShutdownHook(
            config.getLogger('shutdown-hook'),
            'test-shutdown',
            async () => {
                wasCalled = true;
            },
        );
        expect(() =>
            registerGracefulShutdownHook(
                config.getLogger('shutdown-hook'),
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
        registerGracefulShutdownHook(
            config.getLogger('shutdown-hook'),
            'hook-1',
            async () => {
                wasCalled = true;
            },
        );
        registerGracefulShutdownHook(
            config.getLogger('shutdown-hook'),
            'hook-2',
            async () => {
                secondWasCalled = true;
            },
        );
        await executeShutdownHooks(config.getLogger('graceful-shutdown'));
        expect(wasCalled).toEqual(true);
        expect(secondWasCalled).toEqual(true);
    });

    test('Shutdown will wait on all hooks', async () => {
        const config = createTestConfig({});
        let wasCalled = false;
        let secondWasCalled = false;
        registerGracefulShutdownHook(
            config.getLogger('shutdown-hook'),
            'hook-1',
            async () => {
                wasCalled = true;
            },
        );
        registerGracefulShutdownHook(
            config.getLogger('shutdown-hook'),
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
        await executeShutdownHooks(config.getLogger('graceful-shutdown'));
        expect(wasCalled).toEqual(true);
        expect(secondWasCalled).toEqual(true);
    });
    test('Calling executeShutdownHooks should empty the registered shutdown hooks', async () => {
        const config = createTestConfig({});
        let wasCalled = false;
        registerGracefulShutdownHook(
            config.getLogger('shutdown-hook'),
            'hook-1',
            async () => {
                wasCalled = true;
            },
        );
        await executeShutdownHooks(config.getLogger('graceful-shutdown'));
        expect(() =>
            registerGracefulShutdownHook(
                config.getLogger('shutdown-hook'),
                'hook-1',
                async () => {
                    wasCalled = true;
                },
            ),
        ).not.toThrow();
    });
});
