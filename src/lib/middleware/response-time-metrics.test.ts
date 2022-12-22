import { IUnleashConfig } from '../types/option';
import { createTestConfig } from '../../test/config/test-config';
import { InstanceStatsService } from 'lib/services';
import { responseTimeMetrics } from './response-time-metrics';

let config: IUnleashConfig;
let instanceStatsService: Pick<InstanceStatsService, 'getLabeledAppCounts'>;
const cb = jest.fn();

const req = {
    headers: {
        'unleash-appname': 'test',
    },
};

const res = {
    statusCode: 200,
    writeHead: (status: number) => console.log('Mocked write head ' + status),
    find: jest.fn(),
};
// attempt to mock response-time to directly call our function
jest.mock('response-time', () => (fn: any) => {
    console.log('=Pre fn=');
    fn(req, res, cb);
    console.log('=Post fn=');
});

beforeEach(() => {
    config = createTestConfig();
    instanceStatsService = {
        getLabeledAppCounts: jest
            .fn()
            .mockReturnValue([{ range: '7d', count: 5 }]),
    };
});

test('getLabeledAppCounts', async () => {
    const flagResolver = {
        getAll: jest.fn(),
        isEnabled: jest.fn().mockReturnValue(true),
    };

    await responseTimeMetrics(
        config.eventBus,
        flagResolver,
        instanceStatsService,
    );

    await responseTimeMetrics(
        config.eventBus,
        flagResolver,
        instanceStatsService,
    );

    // console.log(middleware);
    // await middleware(req, res, cb);
    // res.writeHead(200); // this executes the function
    // // await middleware(req, res, cb);
    // res.writeHead(200); // this executes the function twice

    expect(flagResolver.isEnabled).toBeCalledTimes(2);
    expect(instanceStatsService.getLabeledAppCounts).toBeCalledTimes(1);
});
