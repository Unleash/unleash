import fc, { Arbitrary } from 'fast-check';
import {
    playgroundResponseSchema,
    PlaygroundResponseSchema,
} from '../../../lib/openapi/spec/playground-response-schema';
import { validateSchema } from '../validate';
import { generate as generateInput } from './playground-request-schema.test';
import { generate as generateFeature } from './playground-feature-schema.test';

const generate = (): Arbitrary<PlaygroundResponseSchema> =>
    fc.record({
        input: generateInput(),
        features: fc.uniqueArray(generateFeature(), {
            selector: (feature) => feature.name,
        }),
    });

test('playgroundResponseSchema', () =>
    fc.assert(
        fc.property(
            generate(),
            (data: PlaygroundResponseSchema) =>
                validateSchema(playgroundResponseSchema.$id, data) ===
                undefined,
        ),
    ));
