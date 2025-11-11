import {
    responseTimeMetrics,
    storeRequestedRoute,
} from './response-time-metrics.js';
import { REQUEST_TIME } from '../metric-events.js';
import { vi } from 'vitest';
import type { IFlagResolver } from '../server-impl.js';
import EventEmitter from 'events';

const isDefined = async (timeInfo: any, limit = 10) => {
    let counter = 0;
    while (timeInfo === undefined) {
        // Waiting for event to be triggered
        await new Promise((resolve) => setTimeout(resolve, 10));
        counter++;
        if (counter > limit) {
            throw new Error('Event was not triggered');
        }
    }
};

const flagResolver = {
    isEnabled: vi.fn(),
    getAll: vi.fn(),
    getVariant: vi.fn(),
    getStaticContext: vi.fn(),
} as IFlagResolver;

// Make sure it's always cleaned up
let res: any;
beforeEach(() => {
    res = {
        statusCode: 200,
        locals: {}, // res will always have locals (according to express RequestHandler type)
        once: vi.fn((event: string, callback: () => void) => {
            if (event === 'finish') {
                callback();
            }
        }),
    };
});

describe('responseTimeMetrics new behavior', () => {
    const instanceStatsService = {
        getAppCountSnapshot: vi.fn() as () => number | undefined,
    };
    const eventBus = new EventEmitter();

    test('uses baseUrl and route path to report metrics with flag enabled, but no res.locals.route', async () => {
        let timeInfo: any;
        // register a listener
        eventBus.on(REQUEST_TIME, (data) => {
            timeInfo = data;
        });
        const middleware = responseTimeMetrics(
            eventBus,
            flagResolver,
            instanceStatsService,
        );
        const req = {
            baseUrl: '/api/admin',
            route: {
                path: '/features',
            },
            method: 'GET',
            path: 'should-not-be-used',
            headers: {},
        };

        // @ts-expect-error req doesn't have all properties and we're not passing next
        middleware(req, res, () => {});

        await isDefined(timeInfo);
        expect(timeInfo).toMatchObject({
            path: '/api/admin/features',
            method: 'GET',
            statusCode: 200,
            time: expect.any(Number),
        });
        expect(timeInfo.time).toBeGreaterThan(0);
        expect(res.once).toHaveBeenCalledWith('finish', expect.any(Function));
    });

    test('uses res.locals.route to report metrics when flag enabled', async () => {
        let timeInfo: any;
        // register a listener
        eventBus.on(REQUEST_TIME, (data) => {
            timeInfo = data;
        });
        const middleware = responseTimeMetrics(
            eventBus,
            flagResolver,
            instanceStatsService,
        );
        const req = {
            baseUrl: '/api/admin',
            route: {
                path: '/features',
            },
            method: 'GET',
            path: 'should-not-be-used',
        };
        const reqWithoutRoute = {
            method: 'GET',
            headers: {},
        };

        // @ts-expect-error req and res doesn't have all properties
        storeRequestedRoute(req, res, () => {});
        // @ts-expect-error req and res doesn't have all properties
        middleware(reqWithoutRoute, res, () => {});

        await isDefined(timeInfo);
        expect(timeInfo).toMatchObject({
            path: '/api/admin/features',
            method: 'GET',
            statusCode: 200,
            time: expect.any(Number),
        });
        expect(timeInfo.time).toBeGreaterThan(0);
        expect(res.once).toHaveBeenCalledWith('finish', expect.any(Function));
    });

    test.each([undefined, '/'])(
        'reports (hidden) when route is undefined and path is %s',
        async (path: string) => {
            let timeInfo: any;
            // register a listener
            eventBus.on(REQUEST_TIME, (data) => {
                timeInfo = data;
            });
            const middleware = responseTimeMetrics(
                eventBus,
                flagResolver,
                instanceStatsService,
            );
            const req = {
                baseUrl: '/api/admin',
                method: 'GET',
                path: 'should-not-be-used',
            };
            const reqWithoutRoute = {
                method: 'GET',
                path,
                headers: {},
            };

            // @ts-expect-error req and res doesn't have all properties
            storeRequestedRoute(req, res, () => {});
            // @ts-expect-error req and res doesn't have all properties
            middleware(reqWithoutRoute, res, () => {});

            await isDefined(timeInfo);
            expect(timeInfo).toMatchObject({
                path: '(hidden)',
                method: 'GET',
                statusCode: 200,
                time: expect.any(Number),
            });
            expect(timeInfo.time).toBeGreaterThan(0);
            expect(res.once).toHaveBeenCalledWith(
                'finish',
                expect.any(Function),
            );
        },
    );

    test.each([
        ['/api/admin/features', '/api/admin/features'],
        ['/api/admin/features/my-feature', '/api/admin/features/(hidden)'],
        ['/api/admin/projects', '/api/admin/projects'],
        ['/api/admin/projects/my-project', '/api/admin/projects/(hidden)'],
        ['/api/frontend/client/metrics', '/api/frontend/(hidden)'],
        ['/api/client/metrics', '/api/client/metrics'],
        ['/api/client/metrics/', '/api/client/metrics'],
        ['/api/client/metrics/foo', '/api/client/metrics/(hidden)'],
        [
            '/api/client/metrics/custom/extra',
            '/api/client/metrics/custom/(hidden)',
        ],
        ['/api/client/metrics/bulk', '/api/client/metrics/bulk'],
        ['/api/client/metrics/bulk/foo', '/api/client/metrics/bulk/(hidden)'],
        ['/edge/validate', '/edge/(hidden)'],
        ['/whatever', '(hidden)'],
        ['/healthz', '(hidden)'],
        ['/internal-backstage/prometheus', '(hidden)'],
    ])(
        'when path is %s and route is undefined, reports %s',
        async (path: string, expected: string) => {
            let timeInfo: any;
            // register a listener
            eventBus.on(REQUEST_TIME, (data) => {
                timeInfo = data;
            });
            const middleware = responseTimeMetrics(
                eventBus,
                flagResolver,
                instanceStatsService,
            );
            const req = {
                baseUrl: '/api/admin',
                method: 'GET',
                path: 'should-not-be-used',
            };
            const reqWithoutRoute = {
                method: 'GET',
                path,
                headers: {},
            };

            // @ts-expect-error req and res doesn't have all properties
            storeRequestedRoute(req, res, () => {});
            // @ts-expect-error req and res doesn't have all properties
            middleware(reqWithoutRoute, res, () => {});

            await isDefined(timeInfo);
            expect(timeInfo).toMatchObject({
                path: expected,
                time: expect.any(Number),
                method: 'GET',
                statusCode: 200,
            });
            expect(timeInfo.time).toBeGreaterThan(0);
        },
    );
});
