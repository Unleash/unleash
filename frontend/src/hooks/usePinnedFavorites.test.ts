import { Row } from 'react-table';
import { sortTypesWithFavorites } from './usePinnedFavorites';

const data = [
    {
        id: 1,
        favorite: true,
    },
    {
        id: 2,
        favorite: false,
    },
    {
        id: 3,
        favorite: true,
    },
    {
        id: 4,
        favorite: false,
    },
    {
        id: 5,
        favorite: false,
    },
].map(d => ({ values: d, original: d })) as unknown as Row<object>[];

test('puts favorite items first', () => {
    const output = data.sort((a, b) =>
        sortTypesWithFavorites.alphanumeric(a, b, 'id')
    );
    const ids = output.map(({ values: { id } }) => id);
    const favorites = output.map(({ values: { favorite } }) => favorite);

    expect(ids).toEqual([1, 3, 2, 4, 5]);
    expect(favorites).toEqual([true, true, false, false, false]);
});

test('in descending order put favorites last (react-table will reverse order)', () => {
    const output = data.sort((a, b) =>
        sortTypesWithFavorites.alphanumeric(a, b, 'id', true)
    );
    const ids = output.map(({ values: { id } }) => id);
    const favorites = output.map(({ values: { favorite } }) => favorite);

    expect(ids).toEqual([2, 4, 5, 1, 3]);
    expect(favorites).toEqual([false, false, false, true, true]);
});
