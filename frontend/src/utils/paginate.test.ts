import { paginate } from './paginate';

const createInput = (count: number) => {
    const result = [];

    for (let i = 0; i < count; i++) {
        result.push(i);
    }

    return result;
};

test('it creates the correct amount of pages when count is even', () => {
    const input = createInput(20);
    expect(input.length).toBe(20);

    const paginationResult = paginate(input, 5);
    expect(paginationResult.length).toBe(4);
    expect(Array.isArray(paginationResult[0])).toBe(true);
});

test('it creates the correct amount of pages when count is uneven', () => {
    const input = createInput(33);
    expect(input.length).toBe(33);

    const paginationResult = paginate(input, 9);
    expect(paginationResult.length).toBe(4);

    const paginationCount = paginationResult.reduce((acc, cur) => {
        acc += cur.length;
        return acc;
    }, 0);

    expect(paginationCount).toBe(33);
});
