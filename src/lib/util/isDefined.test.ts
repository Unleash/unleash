import { isDefined } from './isDefined.js';

test('isDefined', () => {
    expect(isDefined(null)).toEqual(false);
    expect(isDefined(undefined)).toEqual(false);
    expect(isDefined(0)).toEqual(true);
    expect(isDefined(false)).toEqual(true);
});
