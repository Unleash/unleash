import { deepDiff } from '../deep-diff'; // Import the deepDiff function

describe('deepDiff', () => {
    test('should sort arrays by name before comparing', () => {
        // Define two arrays that are identical except for the order of elements
        const array1 = [
            { name: 'b', value: 2 },
            { name: 'a', value: 1 },
        ];
        const array2 = [
            { name: 'a', value: 1 },
            { name: 'b', value: 2 },
        ];

        // If the function correctly sorts before comparing, there should be no differences
        const result = deepDiff(array1, array2);

        // Assert that there is no difference
        expect(result).toBeNull();
    });

    it('should return null for equal arrays', () => {
        const arr1 = [1, 2, 3];
        const arr2 = [1, 2, 3];
        expect(deepDiff(arr1, arr2)).toBe(null);
    });

    it('should find differences in arrays with different lengths', () => {
        const arr1 = [1, 2, 3];
        const arr2 = [1, 2, 3, 4];
        expect(deepDiff(arr1, arr2)).toEqual([
            {
                index: [],
                reason: 'Different lengths',
                valueA: arr1,
                valueB: arr2,
            },
        ]);
    });

    it('should find differences in arrays with different values', () => {
        const arr1 = [1, 2, 3];
        const arr2 = [1, 4, 3];
        expect(deepDiff(arr1, arr2)).toEqual([
            {
                index: [1],
                reason: 'Different values',
                valueA: 2,
                valueB: 4,
            },
        ]);
    });

    it('should find differences in arrays with different keys in objects', () => {
        const arr1 = [{ a: 1 }, { b: 2 }];
        const arr2 = [{ a: 1 }, { c: 2 }];
        expect(deepDiff(arr1, arr2)).toEqual([
            {
                index: [1],
                reason: 'Different keys',
                valueA: { b: 2 },
                valueB: { c: 2 },
            },
        ]);
    });

    it('should handle nested differences in objects', () => {
        const arr1 = [{ a: { b: 1 } }, { c: { d: 2 } }];
        const arr2 = [{ a: { b: 1 } }, { c: { d: 3 } }];
        expect(deepDiff(arr1, arr2)).toEqual([
            {
                index: [1, 'c', 'd'],
                reason: 'Different values',
                valueA: 2,
                valueB: 3,
            },
        ]);
    });
});
