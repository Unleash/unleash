import { normalizeDays } from './normalize-days.ts';

test('0 or less', () => {
    const testCases = [0, -1];
    expect(
        testCases.map(normalizeDays).every((text) => text === 'No data'),
    ).toBeTruthy();
});

test('less than one', () => {
    const testCases = [0.1, 0.25, 0.5, 0.9, 0.9999999];
    expect(
        testCases.map(normalizeDays).every((text) => text === '<1 day'),
    ).toBeTruthy();
});

test('rounds to one', () => {
    const testCases = [1.1, 1.25, 1.33, 1.499999];
    expect(
        testCases.map(normalizeDays).every((text) => text === '1 day'),
    ).toBeTruthy();
});

test('1.5 or more', () => {
    const testCases = [1.5, 2.4];
    expect(
        testCases.map(normalizeDays).every((text) => text === '2 days'),
    ).toBeTruthy();
});

test.each([
    [10_000, '10K'],
    [100_000, '100K'],
    [1_000_000, '1M'],
])('Big numbers: %s -> %s', (number, rendered) => {
    expect(normalizeDays(number)).toBe(`${rendered} days`);
});
