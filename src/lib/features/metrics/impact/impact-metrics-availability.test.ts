import { expect, test } from 'vitest';
import { TEST_AUDIT_USER } from '../../../types/core.js';
import { createFakeSettingService } from '../../settings/createSettingService.js';
import { createTestConfig } from '../../../../test/config/test-config.js';
import { ImpactMetricsAvailabilityResolver } from './impact-metrics-availability.js';
import { EXTERNAL_SOURCE_SETTING_KEY } from './external-impact-metrics-source.js';

// any non-empty version turns config.isEnterprise on
const ENTERPRISE = '1.0.0';
const EXTERNAL_SOURCE = { enabled: true, url: 'http://ext:9090' };
const INTERNAL_SOURCE = 'http://localhost:9090';

test('disabled on a non-enterprise instance even with sources', async () => {
    const config = createTestConfig({
        prometheusImpactMetricsApi: INTERNAL_SOURCE,
    });
    const settingService = createFakeSettingService(config);
    await settingService.insert(
        EXTERNAL_SOURCE_SETTING_KEY,
        EXTERNAL_SOURCE,
        TEST_AUDIT_USER,
    );
    const resolver = new ImpactMetricsAvailabilityResolver(
        config,
        settingService,
    );

    expect(await resolver.resolve()).toBe('disabled');
});

test('disabled when the killswitch is on, regardless of sources', async () => {
    const config = createTestConfig({
        enterpriseVersion: ENTERPRISE,
        prometheusImpactMetricsApi: INTERNAL_SOURCE,
        experimental: { flags: { disableImpactMetrics: true } },
    });
    const settingService = createFakeSettingService(config);
    await settingService.insert(
        EXTERNAL_SOURCE_SETTING_KEY,
        EXTERNAL_SOURCE,
        TEST_AUDIT_USER,
    );
    const resolver = new ImpactMetricsAvailabilityResolver(
        config,
        settingService,
    );

    expect(await resolver.resolve()).toBe('disabled');
});

test('unconfigured when no source is set up', async () => {
    const config = createTestConfig({ enterpriseVersion: ENTERPRISE });
    const settingService = createFakeSettingService(config);
    const resolver = new ImpactMetricsAvailabilityResolver(
        config,
        settingService,
    );

    expect(await resolver.resolve()).toBe('unconfigured');
});

test('internal when only the hosted prometheus is configured', async () => {
    const config = createTestConfig({
        enterpriseVersion: ENTERPRISE,
        prometheusImpactMetricsApi: INTERNAL_SOURCE,
    });
    const settingService = createFakeSettingService(config);
    const resolver = new ImpactMetricsAvailabilityResolver(
        config,
        settingService,
    );

    expect(await resolver.resolve()).toBe('internal');
});

test('external when only an external source is configured', async () => {
    const config = createTestConfig({ enterpriseVersion: ENTERPRISE });
    const settingService = createFakeSettingService(config);
    await settingService.insert(
        EXTERNAL_SOURCE_SETTING_KEY,
        EXTERNAL_SOURCE,
        TEST_AUDIT_USER,
    );
    const resolver = new ImpactMetricsAvailabilityResolver(
        config,
        settingService,
    );

    expect(await resolver.resolve()).toBe('external');
});

test('full when both internal and external sources exist', async () => {
    const config = createTestConfig({
        enterpriseVersion: ENTERPRISE,
        prometheusImpactMetricsApi: INTERNAL_SOURCE,
    });
    const settingService = createFakeSettingService(config);
    await settingService.insert(
        EXTERNAL_SOURCE_SETTING_KEY,
        EXTERNAL_SOURCE,
        TEST_AUDIT_USER,
    );
    const resolver = new ImpactMetricsAvailabilityResolver(
        config,
        settingService,
    );

    expect(await resolver.resolve()).toBe('full');
});

test('external source enabled without a url does not count', async () => {
    const config = createTestConfig({ enterpriseVersion: ENTERPRISE });
    const settingService = createFakeSettingService(config);
    await settingService.insert(
        EXTERNAL_SOURCE_SETTING_KEY,
        { enabled: true },
        TEST_AUDIT_USER,
    );
    const resolver = new ImpactMetricsAvailabilityResolver(
        config,
        settingService,
    );

    expect(await resolver.resolve()).toBe('unconfigured');
});

test('external source with a url but disabled does not count', async () => {
    const config = createTestConfig({ enterpriseVersion: ENTERPRISE });
    const settingService = createFakeSettingService(config);
    await settingService.insert(
        EXTERNAL_SOURCE_SETTING_KEY,
        { enabled: false, url: 'http://ext:9090' },
        TEST_AUDIT_USER,
    );
    const resolver = new ImpactMetricsAvailabilityResolver(
        config,
        settingService,
    );

    expect(await resolver.resolve()).toBe('unconfigured');
});
