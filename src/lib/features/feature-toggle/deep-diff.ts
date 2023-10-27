import sortBy from 'lodash.sortby';

interface Difference {
    index: (string | number)[];
    reason: string;
    valueA: any;
    valueB: any;
}

export function deepDiff(arr1: any[], arr2: any[]): Difference[] | null {
    const diff: Difference[] = [];

    function compare(a: any, b: any, parentIndex: (string | number)[]): void {
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) {
                diff.push({
                    index: parentIndex,
                    reason: 'Different lengths',
                    valueA: a,
                    valueB: b,
                });
            } else {
                const sortedA = sortBy(a, 'name');
                const sortedB = sortBy(b, 'name');

                for (let i = 0; i < sortedA.length; i++) {
                    compare(sortedA[i], sortedB[i], parentIndex.concat(i));
                }
            }
        } else if (
            typeof a === 'object' &&
            a !== null &&
            typeof b === 'object' &&
            b !== null
        ) {
            const keysA = Object.keys(a);
            const keysB = Object.keys(b);

            if (
                keysA.length !== keysB.length ||
                !keysA.every((key) => keysB.includes(key))
            ) {
                diff.push({
                    index: parentIndex,
                    reason: 'Different keys',
                    valueA: a,
                    valueB: b,
                });
            } else {
                for (const key of keysA) {
                    compare(a[key], b[key], parentIndex.concat(key));
                }
            }
        } else if (a !== b) {
            diff.push({
                index: parentIndex,
                reason: 'Different values',
                valueA: a,
                valueB: b,
            });
        }
    }

    compare(arr1, arr2, []);

    return diff.length > 0 ? diff : null;
}
