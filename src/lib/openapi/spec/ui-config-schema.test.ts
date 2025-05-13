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
        segmentValuesLimit: 0,
        strategySegmentsLimit: 0,
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
