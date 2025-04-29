import type { Row } from 'react-table';
import { sortTypes } from './sortTypes.js';

const data = [
    {
        id: 1,
        age: 42,
        bool: true,
        value: 0,
    },
    {
        id: 2,
        age: 35,
        bool: false,
        value: 9999999,
    },
    {
        id: 3,
        age: 25,
        bool: true,
        value: 3456,
    },
    {
        id: 4,
        age: 32,
        bool: false,
        value: 3455,
    },
    {
        id: 5,
        age: 18,
        bool: true,
        value: '49585',
    },
].map((d) => ({ values: d })) as unknown as Row<{
    id: number;
    age: number;
    bool: boolean;
}>[];

test('sortTypes', () => {
    expect(
        data
            .sort((a, b) => sortTypes.boolean(a, b, 'bool'))
            .map(({ values: { id } }) => id),
    ).toEqual([2, 4, 1, 3, 5]);

    expect(
        data
            .sort((a, b) => sortTypes.alphanumeric(a, b, 'age'))
            .map(({ values: { age } }) => age),
    ).toEqual([18, 25, 32, 35, 42]);

    expect(
        data
            .sort((a, b) => sortTypes.numericZeroLast(a, b, 'value'))
            .map(({ values: { value } }) => value),
    ).toEqual([3455, 3456, '49585', 9999999, 0]);
});
