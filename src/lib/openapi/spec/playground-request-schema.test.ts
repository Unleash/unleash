import fc, { Arbitrary } from 'fast-check';
import { urlFriendlyString } from '../../../test/arbitraries.test';
import {
    playgroundRequestSchema,
    PlaygroundRequestSchema,
} from '../../../lib/openapi/spec/playground-request-schema';
import { validateSchema } from '../validate';
import { generate as generateContext } from './sdk-context-schema.test';

export const generate = (): Arbitrary<PlaygroundRequestSchema> =>
    fc.record({
        environment: fc.oneof(
            fc.constantFrom('development', 'production', 'default'),
            fc.lorem({ maxCount: 1 }),
        ),
        projects: fc.oneof(
            fc.uniqueArray(
                fc.oneof(fc.lorem({ maxCount: 1 }), urlFriendlyString()),
            ),
            fc.constant('*' as '*'),
        ),
        context: generateContext(),
    });

test('playgroundRequestSchema', () =>
    fc.assert(
        fc.property(
            generate(),
            (data: PlaygroundRequestSchema) =>
                validateSchema(playgroundRequestSchema.$id, data) === undefined,
        ),
    ));
