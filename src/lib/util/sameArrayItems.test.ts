import { sameArrayItems } from './sameArrayItems';

test('sameArrayItems', () => {
    expect(sameArrayItems([], [])).toEqual(true);
    expect(sameArrayItems([1], [1])).toEqual(true);
    expect(sameArrayItems([1], [1, 1])).toEqual(true);
    expect(sameArrayItems([1, 1], [1])).toEqual(true);
    expect(sameArrayItems([1, 2], [1, 2])).toEqual(true);
    expect(sameArrayItems([1, 2], [2, 1])).toEqual(true);
    expect(sameArrayItems([1, 2], [2, 2, 1])).toEqual(true);
    expect(sameArrayItems([1], [])).toEqual(false);
    expect(sameArrayItems([1], [2])).toEqual(false);
    expect(sameArrayItems([1, 2], [1, 3])).toEqual(false);
    expect(sameArrayItems([1, 2], [1, 2, 3])).toEqual(false);
    expect(sameArrayItems([1, 2, 3], [1, 2])).toEqual(false);
    expect(sameArrayItems([1, 2, 3], [1, 2, 4])).toEqual(false);
});
