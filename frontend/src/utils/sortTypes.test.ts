import { Row } from 'react-table';
import { sortTypes } from './sortTypes';

const data = [
    {
        id: 1,
        age: 42,
        bool: true,
    },
    {
        id: 2,
        age: 35,
        bool: false,
    },
    {
        id: 3,
        age: 25,
        bool: true,
    },
    {
        id: 4,
        age: 32,
        bool: false,
    },
    {
        id: 5,
        age: 18,
        bool: true,
    },
].map(d => ({ values: d })) as unknown as Row<{
    id: number;
    age: number;
    bool: boolean;
}>[];

test('sortTypes', () => {
    expect(
        data
            .sort((a, b) => sortTypes.boolean(a, b, 'bool'))
            .map(({ values: { id } }) => id)
    ).toEqual([2, 4, 1, 3, 5]);

    expect(
        data
            .sort((a, b) => sortTypes.alphanumeric(a, b, 'age'))
            .map(({ values: { age } }) => age)
    ).toEqual([18, 25, 32, 35, 42]);
});
