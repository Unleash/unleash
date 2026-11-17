import { expect, test } from 'vitest';
import { omitUndefined } from 'utils/omitUndefined';

test('keys holding undefined are dropped, keys holding other falsy values stay', () => {
    expect(
        omitUndefined({
            gone: undefined,
            empty: '',
            zero: 0,
            no: false,
            nothing: null,
        }),
    ).toStrictEqual({ empty: '', zero: 0, no: false, nothing: null });
});
