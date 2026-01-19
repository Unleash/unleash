import { calculateStability } from './api-operation.js';

test('calculateStability returns alpha when current is before beta and stable', () => {
    expect(
        calculateStability({
            betaReleaseVersion: '7.5.0',
            stableReleaseVersion: '7.7.0',
            currentVersion: '7.4.0',
        }),
    ).toBe('alpha');
});

test('calculateStability returns beta when current is between beta and stable', () => {
    expect(
        calculateStability({
            betaReleaseVersion: '7.5.0',
            stableReleaseVersion: '7.7.0',
            currentVersion: '7.6.0',
        }),
    ).toBe('beta');
});

test('calculateStability returns stable when current is at or after stable', () => {
    expect(
        calculateStability({
            betaReleaseVersion: '7.5.0',
            stableReleaseVersion: '7.7.0',
            currentVersion: '7.7.0',
        }),
    ).toBe('stable');
    expect(
        calculateStability({
            betaReleaseVersion: '7.5.0',
            stableReleaseVersion: '7.7.0',
            currentVersion: '7.8.0',
        }),
    ).toBe('stable');
});

test('calculateStability returns alpha when beta is omitted and current is before stable', () => {
    expect(
        calculateStability({
            stableReleaseVersion: '7.7.0',
            currentVersion: '7.6.0',
        }),
    ).toBe('alpha');
});

test('calculateStability returns stable when beta is omitted and current is after stable', () => {
    expect(
        calculateStability({
            stableReleaseVersion: '7.7.0',
            currentVersion: '7.8.0',
        }),
    ).toBe('stable');
});

test('calculateStability defaults to stable when versions are invalid', () => {
    expect(
        calculateStability({
            betaReleaseVersion: 'not-a-version',
            stableReleaseVersion: '7.7.0',
            currentVersion: '7.4.0',
        }),
    ).toBe('stable');
    expect(
        calculateStability({
            betaReleaseVersion: '7.5.0',
            stableReleaseVersion: 'nope',
            currentVersion: '7.4.0',
        }),
    ).toBe('stable');
    expect(
        calculateStability({
            betaReleaseVersion: '7.5.0',
            stableReleaseVersion: '7.7.0',
            currentVersion: 'nope',
        }),
    ).toBe('stable');
});
