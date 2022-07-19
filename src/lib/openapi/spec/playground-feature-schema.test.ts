import fc, { Arbitrary } from 'fast-check';
import { WeightType } from '../../../lib/types/model';
import { urlFriendlyString } from '../../../test/arbitraries.test';
import { validateSchema } from '../validate';
import {
    playgroundFeatureSchema,
    PlaygroundFeatureSchema,
} from './playground-feature-schema';

export const generate = (): Arbitrary<PlaygroundFeatureSchema> =>
    fc.boolean().chain((isEnabled) =>
        fc.record({
            isEnabled: fc.constant(isEnabled),
            projectId: urlFriendlyString(),
            name: urlFriendlyString(),
            variants: fc.uniqueArray(
                fc.record(
                    {
                        name: urlFriendlyString(),
                        enabled: fc.constant(isEnabled),
                        payload: fc.oneof(
                            fc.record({
                                type: fc.constant('json' as 'json'),
                                value: fc.json(),
                            }),
                            fc.record({
                                type: fc.constant('csv' as 'csv'),
                                value: fc
                                    .array(fc.lorem())
                                    .map((words) => words.join(',')),
                            }),
                            fc.record({
                                type: fc.constant('string' as 'string'),
                                value: fc.string(),
                            }),
                        ),
                        weight: fc.nat({ max: 1000 }),
                        weightType: fc.constant(WeightType.VARIABLE),
                        stickiness: fc.constant('default'),
                    },
                    {
                        requiredKeys: [
                            'name',
                            'enabled',
                            'weight',
                            'stickiness',
                            'weightType',
                        ],
                    },
                ),
                { selector: (variant) => variant.name },
            ),
        }),
    );

test('playgroundFeatureSchema', () =>
    fc.assert(
        fc.property(
            generate(),
            (data: PlaygroundFeatureSchema) =>
                validateSchema(playgroundFeatureSchema.$id, data) === undefined,
        ),
    ));
