import { findDuplicates } from './findDuplicates.js';

test('should find single duplicates', () => {
    expect(findDuplicates([1, 2, 3, 4, 1])).toEqual([1]);
    expect(findDuplicates(['a', 'b', 'a', 'a'])).toEqual(['a']);
});

test('should return an empty array for unique elements', () => {
    expect(findDuplicates(['a', 'b', 'c', 'd'])).toEqual([]);
});

test('should handle arrays with all identical elements', () => {
    expect(findDuplicates([1, 1, 1, 1])).toEqual([1]);
});

test('should handle multiple duplicates', () => {
    expect(findDuplicates([1, 2, 2, 1])).toEqual(
        expect.arrayContaining([1, 2]),
    );
});

test('should handle an empty array', () => {
    expect(findDuplicates([])).toEqual([]);
});

test('should handle arrays with boolean values', () => {
    expect(findDuplicates([true, true, false, false, true])).toEqual(
        expect.arrayContaining([true, false]),
    );
});
