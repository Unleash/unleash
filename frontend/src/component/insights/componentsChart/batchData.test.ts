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

describe('null entry handling', () => {
    it('creates a new entry from the next item, if the accumulated is null', () => {
        const input = [null, 9];
        const result = batchData<number, number>({
            merge: (x, y) => x * y,
            map: Math.sqrt,
        })(input);
        expect(result).toStrictEqual([3]);
    });
    it('merges the accumulated entry with the next item if they are both present', () => {
        const input = [4, 9];
        const result = batchData<number, number>({
            merge: (x, y) => x + y,
            map: (x) => x,
        })(input);
        expect(result).toStrictEqual([13]);
    });
    it('it returns null if both the accumulated and the next item are null', () => {
        const input = [null, null];
        const result = batchData<number, number>({
            merge: (x, y) => x + y,
            map: (x) => x,
        })(input);
        expect(result).toStrictEqual([null]);
    });
    it('it returns the accumulated entry if the next item is null', () => {
        const input = [7, null];
        const result = batchData<number, number>({
            merge: (x, y) => x * y,
            map: (x) => x,
        })(input);
        expect(result).toStrictEqual([7]);
    });
});
