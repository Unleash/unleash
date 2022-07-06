import fc, { Arbitrary } from 'fast-check';
import {
    playgroundRequestSchema,
    PlaygroundRequestSchema,
} from '../../../lib/openapi/spec/playground-request-schema';
import { validateSchema } from '../validate';
import { generate as generateContext } from './sdk-context-schema.test';

export const urlFriendlyString = (): Arbitrary<string> =>
    fc
        .array(
            fc.oneof(
                fc.integer({ min: 0x30, max: 0x39 }).map(String.fromCharCode), // numbers
                fc.integer({ min: 0x41, max: 0x5a }).map(String.fromCharCode), // UPPERCASE LETTERS
                fc.integer({ min: 0x61, max: 0x7a }).map(String.fromCharCode), // lowercase letters
                fc.constantFrom('-', '_', '~', '.'), // rest
                fc.lorem({ maxCount: 1 }), // random words for more 'realistic' names
            ),
            { minLength: 1 },
        )
        .map((arr) => arr.join(''));

test('url-friendly strings are URL-friendly', () =>
    fc.assert(
        fc.property(urlFriendlyString(), (input: string) =>
            /^[\w~.-]+$/.test(input),
        ),
    ));

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
