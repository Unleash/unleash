import { describe, expect, it } from 'vitest';
import { parseAsInteger, parseAsNativeArrayOf, parseAsString } from 'nuqs';
import {
    BooleansStringParam,
    FilterItemParam,
    type FilterItem,
} from './serializeQueryParams.ts';
import {
    encodeParams,
    encodedParamsToSearchParams,
    filterItemParam,
    strictBooleanParam,
} from './nuqsParams.ts';

// nuqs parsers must return null for absent/invalid input; the original
// use-query-params serializers use undefined. Normalize so parity
// assertions compare the "absent" concept, not the specific nullish token.
const absent = (value: unknown) => (value == null ? null : value);

describe('filterItemParam parity with FilterItemParam', () => {
    it.each([
        'IS:a',
        'IS:a,b',
        'IS_ANY_OF:x,y,z',
        'INCLUDE_ALL_OF:a,b',
        'bogus',
        'noColon',
        'IS:',
        '',
    ])('parse(%j) matches decode', (input) => {
        expect(absent(filterItemParam.parse(input))).toEqual(
            absent(FilterItemParam.decode(input)),
        );
    });

    it.each<FilterItem>([
        { operator: 'IS', values: ['a'] },
        { operator: 'IS', values: ['a', 'b'] },
        { operator: 'INCLUDE_ALL_OF', values: ['x', 'y'] },
    ])('serialize(%j) matches encode', (input) => {
        expect(filterItemParam.serialize(input)).toBe(
            FilterItemParam.encode(input),
        );
    });

    // KNOWN DIVERGENCE: the old encoder omits empty-values
    // filters (encode -> undefined), but a nuqs `serialize` must return a
    // string, so it writes 'IS:' which does NOT round-trip
    // (parse('IS:') -> null). Only reachable once nuqs drives WRITES (flag
    // flip) — a decoded state never holds an empty-values filter because the
    // parse regex requires at least one value char. Resolve when wiring the
    // flag, by clearing filters via null instead of { values: [] }.
    it('KNOWN DIVERGENCE: empty values do not round-trip under nuqs', () => {
        const empty: FilterItem = { operator: 'IS', values: [] };
        expect(FilterItemParam.encode(empty)).toBeUndefined();
        expect(filterItemParam.serialize(empty)).toBe('IS:');
        expect(filterItemParam.parse('IS:')).toBeNull();
    });
});

describe('strictBooleanParam parity with BooleansStringParam', () => {
    it.each([
        'true',
        'false',
        'maybe',
        '1',
        '',
    ])('parse(%j) matches decode', (input) => {
        expect(absent(strictBooleanParam.parse(input))).toEqual(
            absent(BooleansStringParam.decode(input)),
        );
    });

    it.each([true, false])('serialize(%j) matches encode', (input) => {
        expect(strictBooleanParam.serialize(input)).toBe(
            BooleansStringParam.encode(input),
        );
    });
});

describe('encodeParams', () => {
    const parsers = {
        q: parseAsString,
        n: parseAsInteger,
        cols: parseAsNativeArrayOf(parseAsString),
    };

    it('serializes present values, multi-parser values to string[]', () => {
        expect(
            encodeParams(parsers, { q: 'x', n: 5, cols: ['a', 'b'] }),
        ).toStrictEqual({ q: 'x', n: '5', cols: ['a', 'b'] });
    });

    // Absent values become undefined ENTRIES (key present), matching
    // use-query-params' encodeQueryParams. Every consumer normalizes this:
    // the mapValues(... ? : undefined) API sites, encodedParamsToSearchParams
    // (skips undefined), and the comparison's presentEntries (strips nullish).
    it('maps absent values to undefined entries', () => {
        expect(
            encodeParams(parsers, { q: null, n: undefined, cols: ['a'] }),
        ).toStrictEqual({ q: undefined, n: undefined, cols: ['a'] });
    });
});

describe('encodedParamsToSearchParams', () => {
    it('repeats keys for arrays, skips undefined, preserves order', () => {
        const searchParams = encodedParamsToSearchParams({
            q: 'x',
            cols: ['a', 'b'],
            gone: undefined,
        });
        expect(searchParams.toString()).toBe('q=x&cols=a&cols=b');
    });
});
