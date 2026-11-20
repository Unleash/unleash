import { describe, expect, it } from 'vitest';
import { TagFilterItemParam } from './serializeQueryParams';

describe('TagFilterItemParam', () => {
    it('preserves existing comma-delimited links', () => {
        const input = 'INCLUDE_ALL_OF:simple:one,other:two';
        const decoded = TagFilterItemParam.decode(input);
        expect(decoded).toEqual({
            operator: 'INCLUDE_ALL_OF',
            values: ['simple:one', 'other:two'],
        });
        expect(TagFilterItemParam.encode(decoded)).toBe(input);
    });

    it('preserves punctuation and spaces in both structured and ordinary tag entries', () => {
        const filter = {
            operator: 'EXCLUDE_IF_ANY_OF',
            values: ['simple:sales, marketing', 'other:100% "okay" & yes'],
        };
        const encoded = TagFilterItemParam.encode(filter);
        const params = new URLSearchParams({ tag: encoded! });

        expect(encoded).toBe(
            `EXCLUDE_IF_ANY_OF_JSON:${JSON.stringify(filter.values)}`,
        );
        expect(TagFilterItemParam.decode(params.get('tag'))).toEqual(filter);
    });

    it.each([
        'INCLUDE_JSON:[]',
        'INCLUDE_JSON:[42]',
        'INCLUDE_JSON:["missing-tag-type"]',
        'INCLUDE_JSON:["simple:value"',
    ])('retains invalid explicit input for API validation: %s', (input) => {
        expect(
            TagFilterItemParam.encode(TagFilterItemParam.decode(input)),
        ).toBe(input);
    });
});
