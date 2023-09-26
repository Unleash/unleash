import { validateSchema } from '../validate';
import { UpdateFeatureStrategySegmentsSchema } from './update-feature-strategy-segments-schema';

test('updateFeatureStrategySegmentsSchema schema', () => {
    const data: UpdateFeatureStrategySegmentsSchema = {
        strategyId: '1',
        segmentIds: [1, 2],
        projectId: 'default',
        environmentId: 'default',
        additional: 'property',
    };

    expect(
        validateSchema(
            '#/components/schemas/updateFeatureStrategySegmentsSchema',
            data,
        ),
    ).toBeUndefined();

    expect(
        validateSchema(
            '#/components/schemas/updateFeatureStrategySegmentsSchema',
            {},
        ),
    ).toMatchSnapshot();

    expect(
        validateSchema(
            '#/components/schemas/updateFeatureStrategySegmentsSchema',
            {
                strategyId: '1',
                segmentIds: [],
            },
        ),
    ).toMatchSnapshot();
});
