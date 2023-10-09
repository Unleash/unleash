import { IFeatureOverview } from '../../../../types';
import { LastSeenMapper } from '../last-seen-mapper';
import getLogger from '../../../../../test/fixtures/no-logger';

test('should produce correct output when mapped', () => {
    const mapper = new LastSeenMapper();

    const inputLastSeen = {
        exp: {
            production: { lastSeen: '2023-10-05T07:27:04.286Z' },
            development: { lastSeen: '2023-10-04T19:03:29.682Z' },
        },
        'payment-system': {
            production: { lastSeen: '2023-10-05T07:27:04.286Z' },
            development: { lastSeen: '2023-10-04T19:03:29.682Z' },
        },
    };

    const inputFeatures: IFeatureOverview[] = [
        {
            type: 'release',
            description: null,
            favorite: false,
            name: 'payment-system',
            // @ts-ignore
            createdAt: '2023-06-30T12:57:20.476Z',
            // @ts-ignore
            lastSeenAt: '2023-10-03T13:08:16.263Z',
            stale: false,
            impressionData: false,
            environments: [
                {
                    name: 'development',
                    enabled: false,
                    type: 'development',
                    sortOrder: 2,
                    variantCount: 0,
                    // @ts-ignore
                    lastSeenAt: '2023-10-04T19:03:29.682Z',
                },
                {
                    name: 'production',
                    enabled: true,
                    type: 'production',
                    sortOrder: 3,
                    variantCount: 0,
                    // @ts-ignore
                    lastSeenAt: '2023-10-05T07:27:04.286Z',
                },
            ],
        },
        {
            type: 'experiment',
            description: null,
            favorite: false,
            name: 'exp',
            // @ts-ignore
            createdAt: '2023-09-13T08:08:28.211Z',
            // @ts-ignore
            lastSeenAt: '2023-10-03T13:08:16.263Z',
            stale: false,
            impressionData: false,
            environments: [
                {
                    name: 'development',
                    enabled: false,
                    type: 'development',
                    sortOrder: 2,
                    variantCount: 0,
                    // @ts-ignore
                    lastSeenAt: '2023-10-04T19:03:29.682Z',
                },
                {
                    name: 'production',
                    enabled: true,
                    type: 'production',
                    sortOrder: 3,
                    variantCount: 0,
                    // @ts-ignore
                    lastSeenAt: '2023-10-05T07:27:04.286Z',
                },
            ],
        },
    ];

    const logger = getLogger();

    const result = mapper.mapToFeatures(inputFeatures, inputLastSeen, logger);

    expect(result[0].environments[0].name).toBe('development');
    expect(result[0].name).toBe('payment-system');
    expect(result[0].environments[0].lastSeenAt).toEqual(
        new Date(inputLastSeen['payment-system'].development.lastSeen),
    );
});
