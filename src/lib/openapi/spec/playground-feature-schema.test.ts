import fc, { Arbitrary } from 'fast-check';
import { validateSchema } from '../validate';
import {
    playgroundFeatureSchema,
    PlaygroundFeatureSchema,
} from './playground-feature-schema';
import { urlFriendlyString } from './playground-request-schema.test';

export const generate = (): Arbitrary<PlaygroundFeatureSchema> =>
    fc.boolean().chain((isEnabled) =>
        fc.record({
            isEnabled: fc.constant(isEnabled),
            projectId: urlFriendlyString(),
            name: urlFriendlyString(),
            variant: fc.record(
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
                },
                { requiredKeys: ['name', 'enabled'] },
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
