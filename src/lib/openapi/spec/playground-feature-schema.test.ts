import fc, { Arbitrary } from 'fast-check';
import { validateSchema } from '../validate';
import {
    playgroundFeatureSchema,
    PlaygroundFeatureSchema,
} from './playground-feature-schema';
import { urlFriendlyString } from './playground-request-schema.test';

export const generate = (): Arbitrary<PlaygroundFeatureSchema> =>
    fc.record({
        isEnabled: fc.boolean(),
        projectId: urlFriendlyString(),
        name: urlFriendlyString(),
        variant: fc.option(urlFriendlyString()),
    });

test('playgroundFeatureSchema', () =>
    fc.assert(
        fc.property(
            generate(),
            (data: PlaygroundFeatureSchema) =>
                validateSchema(playgroundFeatureSchema.$id, data) === undefined,
        ),
    ));
