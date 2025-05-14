import { validateSchema } from '../validate.js';
import type { ResourceLimitsSchema } from './resource-limits-schema.js';
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
        } as ResourceLimitsSchema,
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
