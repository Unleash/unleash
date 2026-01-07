import { validateSchema } from '../validate.js';
import type { UiConfigSchema } from './ui-config-schema.js';

test('uiConfigSchema', () => {
    const data: UiConfigSchema = {
        slogan: 'a',
        version: 'a',
        unleashUrl: 'a',
        baseUriPath: 'a',
        environment: 'a',
        disablePasswordAuth: false,
        resourceLimits: {
            segmentValues: 0,
            strategySegments: 0,
            actionSetActions: 0,
            actionSetsPerProject: 0,
            actionSetFilters: 0,
            actionSetFilterValues: 0,
            signalEndpoints: 0,
            signalTokensPerEndpoint: 0,
            featureEnvironmentStrategies: 0,
            constraintValues: 0,
            environments: 1,
            projects: 1,
            apiTokens: 0,
            segments: 0,
            featureFlags: 1,
            constraints: 0,
            releaseTemplates: 0,
        },
        versionInfo: {
            current: {},
            latest: {},
            isLatest: true,
            instanceId: 'a',
        },
    };

    expect(
        validateSchema('#/components/schemas/uiConfigSchema', data),
    ).toBeUndefined();
});
