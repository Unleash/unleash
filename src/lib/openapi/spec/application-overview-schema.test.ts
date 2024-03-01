import { validateSchema } from '../validate';

test('applicationOverviewSchema', () => {
    const app = {
        projects: ['default', 'dx'],
        featureCount: 12,
        issues: {
            missingStrategies: [],
        },
        environments: [
            {
                name: 'production',
                instanceCount: 34,
                sdks: ['unleash-client-node:5.4.0'],
                lastSeen: '2021-10-01T12:00:00Z',
                issues: {
                    missingFeatures: ['feature1'],
                    outdatedSdks: ['node-unleash-client:5.3.0'],
                },
            },
            {
                name: 'development',
                instanceCount: 16,
                sdks: ['unleash-client-java:5.4.0'],
                lastSeen: '2021-10-01T12:00:00Z',
                issues: {
                    missingFeatures: [],
                    outdatedSdks: [],
                },
            },
        ],
    };

    expect(
        validateSchema('#/components/schemas/applicationOverviewSchema', app),
    ).toBeUndefined();
});
