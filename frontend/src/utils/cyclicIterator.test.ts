import { CyclicIterator } from './cyclicIterator';

test('loops around the list', () => {
    const iterator = new CyclicIterator<number>([1, 3, 5, 7]);
    expect(iterator.next()).toEqual(1);
    expect(iterator.next()).toEqual(3);
    expect(iterator.next()).toEqual(5);
    expect(iterator.next()).toEqual(7);
    expect(iterator.next()).toEqual(1);
    expect(iterator.next()).toEqual(3);
    expect(iterator.next()).toEqual(5);
    expect(iterator.next()).toEqual(7);
    expect(iterator.next()).toEqual(1);
});
