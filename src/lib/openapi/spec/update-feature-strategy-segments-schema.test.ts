import { validateSchema } from '../validate.js';
import type { UpdateFeatureStrategySegmentsSchema } from './update-feature-strategy-segments-schema.js';

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
