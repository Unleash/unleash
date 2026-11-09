import { register } from 'prom-client';
import { expect, test } from 'vitest';
import { createTestConfig } from '../../../test/config/test-config.js';
import createStores from '../../../test/fixtures/store.js';
import FakeEnvironmentStore from '../project-environments/fake-environment-store.js';
import { registerPrometheusMetrics } from '../../metrics.js';
import { TOKEN_CACHE_LOOKUP, emitMetricEvent } from '../../metric-events.js';
import { createFakeApiTokenService } from './createApiTokenService.js';
import { ApiTokenType, type IApiTokenCreate } from '../../types/model.js';
import { SYSTEM_USER_ID } from '../../types/index.js';
import { DEFAULT_ENV } from '../../util/index.js';

const setup = () => {
    register.clear();
    const config = createTestConfig();
    const stores = createStores();
    stores.environmentStore = new FakeEnvironmentStore();

    // only touches instanceStatsService from inside
    // the gauge collectors, which these tests never trigger.
    registerPrometheusMetrics(
        config,
        stores,
        '4.0.0',
        config.eventBus,
        {} as any,
    );
    return { config, eventBus: config.eventBus };
};

const seriesFor = async (name: string) => {
    const metric = register.getSingleMetric(name);
    expect(metric, `metric ${name} is not registered`).toBeDefined();
    return (await metric!.get()).values;
};

test('lookups are counted per cache and result', async () => {
    const { eventBus } = setup();

    for (const payload of [
        { cache: 'api-token-v1', result: 'hit' },
        { cache: 'api-token-v1', result: 'hit' },
        { cache: 'api-token-v2', result: 'miss' },
        { cache: 'api-token-v2', result: 'throttled' },
    ] as const) {
        emitMetricEvent(eventBus, TOKEN_CACHE_LOOKUP, payload);
    }

    expect(await seriesFor('token_cache_lookup_total')).toEqual(
        expect.arrayContaining([
            expect.objectContaining({
                labels: { cache: 'api-token-v1', result: 'hit' },
                value: 2,
            }),
            expect.objectContaining({
                labels: { cache: 'api-token-v2', result: 'miss' },
                value: 1,
            }),
            expect.objectContaining({
                labels: { cache: 'api-token-v2', result: 'throttled' },
                value: 1,
            }),
        ]),
    );
});

test('label values stay within the declared result set', async () => {
    const { eventBus } = setup();

    emitMetricEvent(eventBus, TOKEN_CACHE_LOOKUP, {
        cache: 'api-token-v1',
        result: 'hit',
    });

    // result is a closed set, so a future change that derives a label from request data
    // would show up here rather than as a slow Prometheus
    const allowed = {
        cache: ['api-token-v1', 'api-token-v2'],
        result: ['hit', 'miss', 'throttled'],
    };

    for (const series of await seriesFor('token_cache_lookup_total')) {
        expect(allowed.cache).toContain(series.labels.cache);
        expect(allowed.result).toContain(series.labels.result);
    }
});

test('a real token lookup puts no token material in the scrape output', async () => {
    const { config } = setup();
    const secret = 'default:development.d34db33fd34db33fd34db33f';
    const alias = 'default:development.a1a1a1a1a1a1a1a1a1a1a1a1';

    const { apiTokenService, apiTokenStore } =
        createFakeApiTokenService(config);
    await apiTokenStore.insert(
        {
            environment: DEFAULT_ENV,
            projects: ['*'],
            secret,
            alias,
            tokenName: 'metrics-guard',
            type: ApiTokenType.FRONTEND,
        } as IApiTokenCreate,
        SYSTEM_USER_ID,
    );
    await apiTokenService.fetchActiveTokens();

    await apiTokenService.getTokenWithCache(secret);
    await apiTokenService.getTokenWithCache(alias);
    await apiTokenService.getTokenWithCache('default:development.not-a-token');

    const scrape = await register.metrics();

    // assert what really the service passes to the metric layer

    expect(scrape).toContain('token_cache_lookup_total');

    for (const material of [secret, alias, 'd34db33f', 'a1a1a1a1']) {
        expect(
            scrape,
            `token material leaked into the metrics output: ${material}`,
        ).not.toContain(material);
    }
});
