import { validateSchema } from '../validate';
import { ExportResultSchema } from './export-result-schema';

test('exportResultSchema', () => {
    const data: ExportResultSchema = {
        features: [
            {
                name: 'some-toggle1',
                description: '',
                type: 'release',
                project: 'myproject',
                stale: false,
                impressionData: false,
                archived: false,
            },
        ],
        featureStrategies: [
            {
                name: 'default',
                id: '784f2bc1-ba45-4a92-a6d6-a80e18a4e407',
                featureName: 'some-toggle1',
                parameters: {},
                constraints: [
                    {
                        values: ['ew'],
                        inverted: false,
                        operator: 'IN',
                        contextName: 'appName',
                        caseInsensitive: false,
                    },
                    {
                        values: ['e'],
                        inverted: false,
                        operator: 'IN',
                        contextName: 'userId',
                        caseInsensitive: false,
                    },
                ],
                segments: [],
            },
        ],
        featureEnvironments: [
            {
                enabled: true,
                featureName: 'some-toggle1',
                environment: 'development',
                variants: [
                    {
                        name: 'blue',
                        weight: 500,
                        overrides: [
                            { values: ['best'], contextName: 'appName' },
                        ],
                        stickiness: 'default',
                        weightType: 'variable',
                    },
                    {
                        name: 'red',
                        weight: 500,
                        payload: { type: 'string', value: 'dsfsd' },
                        overrides: [
                            { values: ['worst'], contextName: 'appName' },
                        ],
                        stickiness: 'default',
                        weightType: 'variable',
                    },
                ],
                name: 'some-toggle1',
            },
        ],
        contextFields: [
            {
                name: 'appName',
                description: 'Allows you to constrain on application name',
                stickiness: false,
                sortOrder: 2,
                legalValues: [],
            },
            {
                name: 'userId',
                description: 'Allows you to constrain on userId',
                stickiness: false,
                sortOrder: 1,
                legalValues: [],
            },
        ],
        featureTags: [
            {
                featureName: 'some-toggle',
                tagType: 'simple',
                tagValue: 'best-tag',
            },
            { featureName: 'wat', tagType: 'simple', tagValue: 'best-tag' },
            {
                featureName: 'some-toggle1',
                tagType: 'simple',
                tagValue: 'best-tag',
            },
        ],
        segments: [],
        tagTypes: [{ name: 'simple', description: 'test' }],
    };

    expect(
        validateSchema('#/components/schemas/exportResultSchema', data),
    ).toBeUndefined();
});
