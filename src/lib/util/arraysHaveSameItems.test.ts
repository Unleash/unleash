import { arraysHaveSameItems } from './arraysHaveSameItems';

test('arraysHaveSameItems', () => {
    expect(arraysHaveSameItems([], [])).toEqual(true);
    expect(arraysHaveSameItems([1], [1])).toEqual(true);
    expect(arraysHaveSameItems([1], [1, 1])).toEqual(true);
    expect(arraysHaveSameItems([1, 1], [1])).toEqual(true);
    expect(arraysHaveSameItems([1, 2], [1, 2])).toEqual(true);
    expect(arraysHaveSameItems([1, 2], [2, 1])).toEqual(true);
    expect(arraysHaveSameItems([1, 2], [2, 2, 1])).toEqual(true);
    expect(arraysHaveSameItems([1], [])).toEqual(false);
    expect(arraysHaveSameItems([1], [2])).toEqual(false);
    expect(arraysHaveSameItems([1, 2], [1, 3])).toEqual(false);
    expect(arraysHaveSameItems([1, 2], [1, 2, 3])).toEqual(false);
    expect(arraysHaveSameItems([1, 2, 3], [1, 2])).toEqual(false);
    expect(arraysHaveSameItems([1, 2, 3], [1, 2, 4])).toEqual(false);
});
