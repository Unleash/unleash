import { calculatePaginationInfo } from './useEventLogSearch.js';

test.each([
    [{ offset: 5, pageSize: 2 }, { currentPage: 2 }],
    [{ offset: 6, pageSize: 2 }, { currentPage: 3 }],
])('it calculates currentPage correctly', (input, output) => {
    const result = calculatePaginationInfo(input);
    expect(result).toMatchObject(output);
});

test("it doesn't try to divide by zero", () => {
    const result = calculatePaginationInfo({ offset: 0, pageSize: 0 });

    expect(result.currentPage).not.toBeNaN();
});

test('it calculates the correct offsets', () => {
    const result = calculatePaginationInfo({ offset: 50, pageSize: 25 });

    expect(result).toMatchObject({
        currentPage: 2,
        nextPageOffset: 75,
        previousPageOffset: 25,
    });
});

test(`it "fixes" offsets if you've set a weird offset`, () => {
    const result = calculatePaginationInfo({ offset: 35, pageSize: 25 });

    expect(result).toMatchObject({
        currentPage: 1,
        nextPageOffset: 50,
        previousPageOffset: 0,
    });
});
