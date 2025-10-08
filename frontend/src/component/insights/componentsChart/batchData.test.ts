import { batchData } from './batchData.ts';

it('handles empty input', () => {
    expect(
        batchData(
            (x, _) => x,
            (x) => x,
        )([]),
    ).toEqual([]);
});

it('batches by 4, starting from the first entry', () => {
    const input = [7, 11, 13, 19, 23];

    expect(
        batchData<number, number>(
            (x, y) => x + y,
            (x) => x,
        )(input),
    ).toStrictEqual([50, 23]);
});
