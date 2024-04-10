import { EventEmitter } from 'stream';
import {
    responseTimeMetrics,
    storeRequestedRoute,
} from './response-time-metrics';
import { REQUEST_TIME } from '../metric-events';

const fixedResponseTime = 100;
// mock response-time library
jest.mock('response-time', () => {
    return (responseTimeMetricsFn) => {
        return (req, res) => {
            return responseTimeMetricsFn(req, res, fixedResponseTime);
        };
    };
});

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
    isEnabled: jest.fn(),
    getAll: jest.fn(),
    getVariant: jest.fn(),
};

// Make sure it's always cleaned up
let res: any;
beforeEach(() => {
    res = {
        statusCode: 200,
        locals: {}, // res will always have locals (according to express RequestHandler type)
    };
});

describe('responseTimeMetrics new behavior', () => {
    const instanceStatsService = {
        getAppCountSnapshot: jest.fn(),
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
        };

        // @ts-expect-error req and res doesn't have all properties
        middleware(req, res);

        await isDefined(timeInfo);
        expect(timeInfo).toMatchObject({
            path: '/api/admin/features',
        });
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
        };

        // @ts-expect-error req and res doesn't have all properties
        storeRequestedRoute(req, res, () => {});
        // @ts-expect-error req and res doesn't have all properties
        middleware(reqWithoutRoute, res);

        await isDefined(timeInfo);
        expect(timeInfo).toMatchObject({
            path: '/api/admin/features',
        });
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
        };

        // @ts-expect-error req and res doesn't have all properties
        storeRequestedRoute(req, res, () => {});
        // @ts-expect-error req and res doesn't have all properties
        middleware(reqWithoutRoute, res);

        await isDefined(timeInfo);
        expect(timeInfo).toMatchObject({
            path: '/api/admin/features',
        });
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
            };

            // @ts-expect-error req and res doesn't have all properties
            storeRequestedRoute(req, res, () => {});
            // @ts-expect-error req and res doesn't have all properties
            middleware(reqWithoutRoute, res);

            await isDefined(timeInfo);
            expect(timeInfo).toMatchObject({
                path: '(hidden)',
            });
        },
    );

    test.each([
        ['/api/admin/features', '/api/admin/(hidden)'],
        ['/api/admin/features/my-feature', '/api/admin/(hidden)'],
        ['/api/frontend/client/metrics', '/api/frontend/(hidden)'],
        ['/api/client/metrics', '/api/client/(hidden)'],
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
            };

            // @ts-expect-error req and res doesn't have all properties
            storeRequestedRoute(req, res, () => {});
            // @ts-expect-error req and res doesn't have all properties
            middleware(reqWithoutRoute, res);

            await isDefined(timeInfo);
            expect(timeInfo).toMatchObject({
                path: expected,
            });
        },
    );
});
