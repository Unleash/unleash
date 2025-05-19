import fc, { type Arbitrary } from 'fast-check';
import { urlFriendlyString } from '../../../test/arbitraries.test.js';
import {
    playgroundRequestSchema,
    type PlaygroundRequestSchema,
} from '../../../lib/openapi/spec/playground-request-schema.js';
import { validateSchema } from '../validate.js';
import { generate as generateContext } from './sdk-context-schema.test.js';
import { test } from '@fast-check/vitest';

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
            fc.constant('*' as const),
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
