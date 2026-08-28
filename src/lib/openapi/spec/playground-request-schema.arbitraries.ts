import fc, { type Arbitrary } from 'fast-check';
import { urlFriendlyString } from '../../../test/arbitraries.js';
import type { PlaygroundRequestSchema } from './playground-request-schema.js';
import { generate as generateContext } from './sdk-context-schema.arbitraries.js';

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
