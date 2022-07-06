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
                fc.integer({ min: 0x30, max: 0x39 }), // numbers
                fc.integer({ min: 0x41, max: 0x5a }), // UPPERCASE LETTERS
                fc.integer({ min: 0x61, max: 0x7a }), // lowercase letters
                fc.constantFrom('-', '_', '~', '.'), // rest
            ),
            { minLength: 1 },
        )
        .map((arr) => arr.join(''));

test('url-friendly strings are URL-friendly', () =>
    fc.assert(
        fc.property(
            urlFriendlyString(),
            (input: string) =>
                input.length > 0 &&
                [...input].every((c) => /[a-zA-Z0-9.~_-]/.test(c)),
        ),
    ));

export const generate = (): Arbitrary<PlaygroundRequestSchema> =>
    fc.record({
        environment: urlFriendlyString(),
        projects: fc.uniqueArray(urlFriendlyString()),
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
