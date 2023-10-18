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
                for (let i = 0; i < a.length; i++) {
                    compare(a[i], b[i], parentIndex.concat(i));
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

            if (!arraysEqual(keysA, keysB)) {
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

    function arraysEqual(a: any[], b: any[]): boolean {
        return (
            a.length === b.length &&
            a.sort().every((val, index) => val === b.sort()[index])
        );
    }

    compare(arr1, arr2, []);

    return diff.length > 0 ? diff : null;
}
