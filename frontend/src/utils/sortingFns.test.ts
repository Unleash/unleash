import { expect, test } from 'vitest';
import type { Row } from '@tanstack/react-table';
import { sortingFns } from './sortingFns.js';

type Datum = { id: number; age: number; bool: boolean; value: number | string };

const data: Datum[] = [
    { id: 1, age: 42, bool: true, value: 0 },
    { id: 2, age: 35, bool: false, value: 9999999 },
    { id: 3, age: 25, bool: true, value: 3456 },
    { id: 4, age: 32, bool: false, value: 3455 },
    { id: 5, age: 18, bool: true, value: '49585' },
];

const rows = data.map((datum) => ({
    original: datum,
    getValue: (key: string) => (datum as Record<string, unknown>)[key],
})) as unknown as Row<Datum>[];

test('sortingFns', () => {
    expect(
        rows
            .sort((rowA, rowB) => sortingFns.boolean(rowA, rowB, 'bool'))
            .map((row) => row.original.id),
    ).toEqual([2, 4, 1, 3, 5]);

    expect(
        rows
            .sort((rowA, rowB) => sortingFns.alphanumeric(rowA, rowB, 'age'))
            .map((row) => row.original.age),
    ).toEqual([18, 25, 32, 35, 42]);

    expect(
        rows
            .sort((rowA, rowB) =>
                sortingFns.numericZeroLast(rowA, rowB, 'value'),
            )
            .map((row) => row.original.value),
    ).toEqual([3455, 3456, '49585', 9999999, 0]);
});
