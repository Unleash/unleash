import { createTestConfig } from '../test/config/test-config.js';
import { jest } from '@jest/globals';

// This mock setup MUST be at the top-level, before any other code that might trigger imports.
jest.unstable_mockModule('compression', () => ({
    default: jest.fn().mockImplementation(() => {
        // This is the actual middleware function Express would use
        return (req, res, next) => {
            next();
        };
    }),
}));
let getApp: any;
let compression: any;

const openApiService = {
    // returns a middleware
    validPath: jest.fn().mockReturnValue(() => {}),
    useDocs: jest.fn(),
};

const appModule = await import('./app.js');
getApp = appModule.default;

test('should not throw when valid config', async () => {
    const config = createTestConfig();
    const app = await getApp(config, {}, { openApiService });
    expect(typeof app.listen).toBe('function');
});

test('should call preHook', async () => {
    let called = 0;
    const config = createTestConfig({
        preHook: () => {
            called++;
        },
    });
    await getApp(config, {}, { openApiService });
    expect(called).toBe(1);
});

test('should call preRouterHook', async () => {
    let called = 0;
    const config = createTestConfig({
        preRouterHook: () => {
            called++;
        },
    });
    await getApp(config, {}, { openApiService });
    expect(called).toBe(1);
});

describe('compression middleware', () => {
    beforeAll(async () => {
        jest.resetModules(); // Crucial: Clears the module cache.
        // Import 'compression' AFTER resetModules. This ensures we get the mock.
        const compressionModule = await import('compression');
        compression = compressionModule.default; // `compression` is now our jest.fn()

        // Import 'app.js' AFTER resetModules and AFTER 'compression' is set to the mock.
        // This ensures app.js uses the mocked version of compression.
        const appModule = await import('./app.js');
        getApp = appModule.default;
    });

    beforeEach(() => {
        // Clear call history for the mock before each test in this describe block
        if (
            compression &&
            typeof (compression as jest.Mock).mockClear === 'function'
        ) {
            (compression as jest.Mock).mockClear();
        } else {
            // This case might happen if beforeAll failed or types are unexpected
            console.warn(
                'Compression mock was not available or not a mock function in beforeEach',
            );
        }
    });

    test.each([
        {
            disableCompression: true,
            expectCompressionEnabled: false,
        },
        {
            disableCompression: false,
            expectCompressionEnabled: true,
        },
        {
            disableCompression: null,
            expectCompressionEnabled: true,
        },
        {
            disableCompression: undefined,
            expectCompressionEnabled: true,
        },
    ])(
        `should expect the compression middleware to be $expectCompressionEnabled when configInput.server.disableCompression is $disableCompression`,
        async ({ disableCompression, expectCompressionEnabled }) => {
            const config = createTestConfig({
                server: {
                    disableCompression: disableCompression as any,
                },
            });
            await getApp(config, {}, { openApiService });
            expect(compression).toHaveBeenCalledTimes(
                +expectCompressionEnabled,
            );
        },
    );
});
