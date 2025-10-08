import { batchData } from './batchData.ts';

it('handles empty input', () => {
    expect(batchData({ merge: (x, _) => x, map: (x) => x })([])).toEqual([]);
});

it('batches by 4, starting from the first entry', () => {
    const input = [7, 11, 13, 19, 23];

    expect(
        batchData<number, number>({ merge: (x, y) => x + y, map: (x) => x })(
            input,
        ),
    ).toStrictEqual([50, 23]);
});
