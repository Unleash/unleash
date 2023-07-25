import ClientMetricsServiceV2 from './metrics-service-v2';

import getLogger from '../../../test/fixtures/no-logger';

import createStores from '../../../test/fixtures/store';
import EventEmitter from 'events';
import { LastSeenService } from './last-seen-service';
import { IUnleashConfig } from 'lib/types';

function testSClientMetrics() {
    const stores = createStores();

    const eventBus = new EventEmitter();
    eventBus.emit = jest.fn();

    // @ts-ignore only add config we care about
    const config = { eventBus, getLogger } as IUnleashConfig;

    const lastSeenService = new LastSeenService(stores, config);
    lastSeenService.updateLastSeen = jest.fn();

    const service = new ClientMetricsServiceV2(stores, config, lastSeenService);
    return { clientMetricsService: service, eventBus, lastSeenService };
}

test('process metrics properly', async () => {
    const { clientMetricsService, eventBus, lastSeenService } =
        testSClientMetrics();
    await clientMetricsService.registerClientMetrics(
        {
            appName: 'test',
            bucket: {
                start: '1982-07-25T12:00:00.000Z',
                stop: '2023-07-25T12:00:00.000Z',
                toggles: {
                    myCoolToggle: {
                        yes: 25,
                        no: 42,
                        variants: {
                            blue: 6,
                            green: 15,
                            red: 46,
                        },
                    },
                    myOtherToggle: {
                        yes: 0,
                        no: 100,
                    },
                },
            },
            environment: 'test',
        },
        '127.0.0.1',
    );

    expect(eventBus.emit).toHaveBeenCalledTimes(1);
    expect(lastSeenService.updateLastSeen).toHaveBeenCalledTimes(1);
});

test('process metrics properly even when some names are not url friendly', async () => {
    const { clientMetricsService, eventBus, lastSeenService } =
        testSClientMetrics();
    await clientMetricsService.registerClientMetrics(
        {
            appName: 'test',
            bucket: {
                start: '1982-07-25T12:00:00.000Z',
                stop: '2023-07-25T12:00:00.000Z',
                toggles: {
                    'not url friendly ☹': {
                        yes: 0,
                        no: 100,
                    },
                },
            },
            environment: 'test',
        },
        '127.0.0.1',
    );

    expect(eventBus.emit).toHaveBeenCalledTimes(1);
    expect(lastSeenService.updateLastSeen).toHaveBeenCalledTimes(1);
});
