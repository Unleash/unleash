import { expect, test } from 'vitest';
import type { IFlagResolver } from '../../../types/index.js';
import { TEST_AUDIT_USER } from '../../../types/core.js';
import { createFakeSettingService } from '../../settings/createSettingService.js';
import { createTestConfig } from '../../../../test/config/test-config.js';
import {
    ImpactMetricsAvailabilityResolver,
    type ImpactMetricsAvailability,
    type ImpactMetricsAvailabilityConfig,
} from './impact-metrics-availability.js';
import {
    EXTERNAL_SOURCE_SETTING_KEY,
    type ExternalImpactMetricsSource,
} from './external-impact-metrics-source.js';

const resolve = async (options: {
    isEnterprise?: boolean;
    prometheusImpactMetricsApi?: string;
    disableImpactMetrics?: boolean;
    externalSource?: ExternalImpactMetricsSource;
}): Promise<ImpactMetricsAvailability> => {
    const {
        isEnterprise = true,
        prometheusImpactMetricsApi,
        disableImpactMetrics = false,
        externalSource,
    } = options;

    const config: ImpactMetricsAvailabilityConfig = {
        isEnterprise,
        prometheusImpactMetricsApi,
        flagResolver: {
            isEnabled: (flag) =>
                flag === 'disableImpactMetrics' && disableImpactMetrics,
        } as IFlagResolver,
    };

    const settingService = createFakeSettingService(createTestConfig());
    if (externalSource) {
        await settingService.insert(
            EXTERNAL_SOURCE_SETTING_KEY,
            externalSource,
            TEST_AUDIT_USER,
        );
    }

    return new ImpactMetricsAvailabilityResolver(
        config,
        settingService,
    ).resolve();
};

test('disabled on a non-enterprise instance even with sources', async () => {
    expect(
        await resolve({
            isEnterprise: false,
            prometheusImpactMetricsApi: 'http://localhost:9090',
            externalSource: { enabled: true, url: 'http://ext' },
        }),
    ).toBe('disabled');
});

test('disabled when the killswitch is on, regardless of sources', async () => {
    expect(
        await resolve({
            disableImpactMetrics: true,
            prometheusImpactMetricsApi: 'http://localhost:9090',
            externalSource: { enabled: true, url: 'http://ext' },
        }),
    ).toBe('disabled');
});

test('unconfigured when no source is set up', async () => {
    expect(await resolve({})).toBe('unconfigured');
});

test('internal when only the hosted prometheus is configured', async () => {
    expect(
        await resolve({ prometheusImpactMetricsApi: 'http://localhost:9090' }),
    ).toBe('internal');
});

test('external when only an external source is configured', async () => {
    expect(
        await resolve({ externalSource: { enabled: true, url: 'http://ext' } }),
    ).toBe('external');
});

test('full when both internal and external sources exist', async () => {
    expect(
        await resolve({
            prometheusImpactMetricsApi: 'http://localhost:9090',
            externalSource: { enabled: true, url: 'http://ext' },
        }),
    ).toBe('full');
});

test('external source enabled without a url does not count', async () => {
    expect(await resolve({ externalSource: { enabled: true } })).toBe(
        'unconfigured',
    );
});

test('external source with a url but disabled does not count', async () => {
    expect(
        await resolve({
            externalSource: { enabled: false, url: 'http://ext' },
        }),
    ).toBe('unconfigured');
});
