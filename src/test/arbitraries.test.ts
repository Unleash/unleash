import fc from 'fast-check';
import { urlFriendlyString, variant } from './arbitraries.js';

test('url-friendly strings are URL-friendly', () =>
    fc.assert(
        fc.property(urlFriendlyString(), (input: string) =>
            /^[\w~.-]+$/.test(input),
        ),
    ));

test('variant payloads are either present or undefined; never null', () =>
    fc.assert(
        fc.property(
            variant(),
            (generatedVariant) =>
                !!generatedVariant.payload ||
                generatedVariant.payload === undefined,
        ),
    ));
