import ClientMetricsServiceV2 from './metrics-service-v2';

import getLogger from '../../../../test/fixtures/no-logger';

import createStores from '../../../../test/fixtures/store';
import EventEmitter from 'events';
import { LastSeenService } from '../last-seen/last-seen-service';
import type {
    IClientMetricsStoreV2,
    IUnleashConfig,
} from '../../../../lib/types';
import { endOfDay, startOfHour, subDays, subHours } from 'date-fns';
import type { IClientMetricsEnv } from './client-metrics-store-v2-type';

function initClientMetrics(flagEnabled = true) {
    const stores = createStores();

    const eventBus = new EventEmitter();
    eventBus.emit = jest.fn();

    const config = {
        eventBus,
        getLogger,
        flagResolver: {
            isEnabled: () => {
                return flagEnabled;
            },
        },
    } as unknown as IUnleashConfig;

    const lastSeenService = new LastSeenService(
        {
            lastSeenStore: stores.lastSeenStore,
        },
        config,
    );
    lastSeenService.updateLastSeen = jest.fn();

    const service = new ClientMetricsServiceV2(stores, config, lastSeenService);
    return { clientMetricsService: service, eventBus, lastSeenService };
}

test('process metrics properly', async () => {
    const { clientMetricsService, eventBus, lastSeenService } =
        initClientMetrics();
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

test('process metrics properly even when some names are not url friendly, filtering out invalid names when flag is on', async () => {
    const { clientMetricsService, eventBus, lastSeenService } =
        initClientMetrics();
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

    // only toggle with a bad name gets filtered out
    expect(eventBus.emit).not.toHaveBeenCalled();
    expect(lastSeenService.updateLastSeen).not.toHaveBeenCalled();
});

test('process metrics properly even when some names are not url friendly, with default behavior when flag is off', async () => {
    const { clientMetricsService, eventBus, lastSeenService } =
        initClientMetrics(false);
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

test('get daily client metrics for a toggle', async () => {
    const yesterday = subDays(new Date(), 1);
    const twoDaysAgo = subDays(new Date(), 2);
    const threeDaysAgo = subDays(new Date(), 3);
    const baseData = {
        featureName: 'feature',
        appName: 'test',
        environment: 'development',
        yes: 0,
        no: 0,
    };
    const clientMetricsStoreV2 = {
        getMetricsForFeatureToggleV2(
            featureName: string,
            hoursBack?: number,
        ): Promise<IClientMetricsEnv[]> {
            return Promise.resolve([
                {
                    ...baseData,
                    timestamp: endOfDay(yesterday),
                    yes: 2,
                    no: 1,
                    variants: { a: 1, b: 1 },
                },
            ]);
        },
    } as IClientMetricsStoreV2;
    const config = {
        flagResolver: {
            isEnabled() {
                return true;
            },
        },
        getLogger() {},
    } as unknown as IUnleashConfig;
    const lastSeenService = {} as LastSeenService;
    const service = new ClientMetricsServiceV2(
        { clientMetricsStoreV2 },
        config,
        lastSeenService,
    );

    const metrics = await service.getClientMetricsForToggle('feature', 3 * 24);

    expect(metrics).toMatchObject([
        { ...baseData, timestamp: endOfDay(threeDaysAgo) },
        { ...baseData, timestamp: endOfDay(twoDaysAgo) },
        {
            ...baseData,
            timestamp: endOfDay(yesterday),
            yes: 2,
            no: 1,
            variants: { a: 1, b: 1 },
        },
    ]);
});

test('get hourly client metrics for a toggle', async () => {
    const hourAgo = startOfHour(subHours(new Date(), 1));
    const thisHour = startOfHour(new Date());
    const baseData = {
        featureName: 'feature',
        appName: 'test',
        environment: 'development',
        yes: 0,
        no: 0,
    };
    const clientMetricsStoreV2 = {
        getMetricsForFeatureToggleV2(
            featureName: string,
            hoursBack?: number,
        ): Promise<IClientMetricsEnv[]> {
            return Promise.resolve([
                {
                    ...baseData,
                    timestamp: thisHour,
                    yes: 2,
                    no: 1,
                    variants: { a: 1, b: 1 },
                },
            ]);
        },
    } as IClientMetricsStoreV2;
    const config = {
        flagResolver: {
            isEnabled() {
                return true;
            },
        },
        getLogger() {},
    } as unknown as IUnleashConfig;
    const lastSeenService = {} as LastSeenService;
    const service = new ClientMetricsServiceV2(
        { clientMetricsStoreV2 },
        config,
        lastSeenService,
    );

    const metrics = await service.getClientMetricsForToggle('feature', 2);

    expect(metrics).toMatchObject([
        { ...baseData, timestamp: hourAgo },
        {
            ...baseData,
            timestamp: thisHour,
            yes: 2,
            no: 1,
            variants: { a: 1, b: 1 },
        },
    ]);
});

type MetricSetup = {
    enabledCount: number;
    variantCount: number;
    enabledDailyCount: number;
    variantDailyCount: number;
    limit: number;
};
const setupMetricsService = ({
    enabledCount,
    variantCount,
    enabledDailyCount,
    variantDailyCount,
    limit,
}: MetricSetup) => {
    let aggregationCalled = false;
    let recordedWarning = '';

    const clientMetricsStoreV2 = {
        aggregateDailyMetrics() {
            aggregationCalled = true;
            return Promise.resolve();
        },
        countPreviousDayHourlyMetricsBuckets() {
            return { enabledCount, variantCount };
        },
        countPreviousDayMetricsBuckets() {
            return {
                enabledCount: enabledDailyCount,
                variantCount: variantDailyCount,
            };
        },
    } as unknown as IClientMetricsStoreV2;
    const config = {
        flagResolver: {
            isEnabled() {
                return true;
            },
            getVariant() {
                return { payload: { value: limit } };
            },
        },
        getLogger() {
            return {
                warn(message: string) {
                    recordedWarning = message;
                },
            };
        },
    } as unknown as IUnleashConfig;
    const lastSeenService = {} as LastSeenService;
    const service = new ClientMetricsServiceV2(
        { clientMetricsStoreV2 },
        config,
        lastSeenService,
    );
    return {
        service,
        aggregationCalled: () => aggregationCalled,
        recordedWarning: () => recordedWarning,
    };
};

test('do not aggregate previous day metrics when metrics already calculated', async () => {
    const { service, recordedWarning, aggregationCalled } = setupMetricsService(
        {
            enabledCount: 2,
            variantCount: 4,
            enabledDailyCount: 2,
            variantDailyCount: 4,
            limit: 6,
        },
    );

    await service.aggregateDailyMetrics();

    expect(recordedWarning()).toBe('');
    expect(aggregationCalled()).toBe(false);
});

test('do not aggregate previous day metrics when metrics count is below limit', async () => {
    const { service, recordedWarning, aggregationCalled } = setupMetricsService(
        {
            enabledCount: 2,
            variantCount: 4,
            enabledDailyCount: 0,
            variantDailyCount: 0,
            limit: 5,
        },
    );

    await service.aggregateDailyMetrics();

    expect(recordedWarning()).toBe(
        'Skipping previous day metrics aggregation. Too many results. Expected max value: 5, Actual value: 6',
    );
    expect(aggregationCalled()).toBe(false);
});

test('aggregate previous day metrics', async () => {
    const { service, recordedWarning, aggregationCalled } = setupMetricsService(
        {
            enabledCount: 2,
            variantCount: 4,
            enabledDailyCount: 0,
            variantDailyCount: 0,
            limit: 6,
        },
    );

    await service.aggregateDailyMetrics();

    expect(recordedWarning()).toBe('');
    expect(aggregationCalled()).toBe(true);
});
