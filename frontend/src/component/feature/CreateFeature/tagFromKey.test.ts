import { expect, test } from 'vitest';
import { tagFromKey } from './tagFromKey.ts';

test('splits a type:value key at the first colon, keeping any later colons and special characters in the value', () => {
    expect(tagFromKey('simple:v1:beta')).toEqual({
        type: 'simple',
        value: 'v1:beta',
    });
    expect(tagFromKey('release:2026-10/Q4 (eu-west_1) 50% ünïcödé')).toEqual({
        type: 'release',
        value: '2026-10/Q4 (eu-west_1) 50% ünïcödé',
    });
    expect(tagFromKey('simple:')).toEqual({ type: 'simple', value: '' });
});
