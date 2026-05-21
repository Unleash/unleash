import { expect, test } from 'vitest';
import type { Row } from '@tanstack/react-table';
import { sortingFnsWithFavorites } from './usePinnedFavorites.js';

type Datum = { id: number; favorite: boolean };

const data: Datum[] = [
    { id: 1, favorite: true },
    { id: 2, favorite: false },
    { id: 3, favorite: true },
    { id: 4, favorite: false },
    { id: 5, favorite: false },
];

const rows = data.map((datum) => ({
    original: datum,
    getValue: (key: string) => (datum as Record<string, unknown>)[key],
})) as unknown as Row<Datum>[];

test('puts favorite items first', () => {
    const output = rows.sort((rowA, rowB) =>
        sortingFnsWithFavorites.alphanumeric(rowA, rowB, 'id'),
    );
    const ids = output.map((row) => row.original.id);
    const favorites = output.map((row) => row.original.favorite);

    expect(ids).toEqual([1, 3, 2, 4, 5]);
    expect(favorites).toEqual([true, true, false, false, false]);
});
