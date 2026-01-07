import { validateSchema } from '../validate.js';

test('segmentStrategiesSchema', () => {
    const validExamples = [
        { strategies: [] },
        {
            strategies: [
                {
                    id: 'test',
                    projectId: '2',
                    featureName: 'featureName',
                    strategyName: 'strategyName',
                    environment: 'environment',
                },
            ],
        },
    ];
    validExamples.forEach((obj) => {
        expect(
            validateSchema('#/components/schemas/segmentStrategiesSchema', obj),
        ).toBeUndefined();
    });

    const invalidExamples = [
        'not an object',
        {},
        { notStrategies: [] },
        {
            strategies: [
                {
                    featureName: 'featureName',
                    strategyName: 'strategyName',
                    environment: 'environment',
                },
            ],
        },
    ];
    invalidExamples.forEach((obj) => {
        expect(
            validateSchema('#/components/schemas/segmentStrategiesSchema', obj),
        ).toMatchSnapshot();
    });
});
