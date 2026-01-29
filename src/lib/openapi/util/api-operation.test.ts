import { calculateStability } from './api-operation.js';

test('calculateStability returns alpha when current is before alpha cutoff', () => {
    expect(
        calculateStability({
            alphaUntilVersion: '7.5.0',
            betaUntilVersion: '7.7.0',
            currentVersion: '7.4.0',
        }),
    ).toBe('alpha');
});

test('calculateStability returns beta when current is between alpha and beta cutoffs', () => {
    expect(
        calculateStability({
            alphaUntilVersion: '7.5.0',
            betaUntilVersion: '7.7.0',
            currentVersion: '7.6.0',
        }),
    ).toBe('beta');
});

test('calculateStability returns stable when current is at or after beta cutoff', () => {
    expect(
        calculateStability({
            alphaUntilVersion: '7.5.0',
            betaUntilVersion: '7.7.0',
            currentVersion: '7.7.0',
        }),
    ).toBe('stable');
    expect(
        calculateStability({
            alphaUntilVersion: '7.5.0',
            betaUntilVersion: '7.7.0',
            currentVersion: '7.8.0',
        }),
    ).toBe('stable');
});

test('calculateStability returns beta when beta cutoff is set without alpha', () => {
    expect(
        calculateStability({
            betaUntilVersion: '7.6.0',
            currentVersion: '7.4.0',
        }),
    ).toBe('beta');
});

test('calculateStability returns stable when beta cutoff is omitted and current is after alpha', () => {
    expect(
        calculateStability({
            alphaUntilVersion: '7.5.0',
            currentVersion: '7.6.0',
        }),
    ).toBe('stable');
});

test('calculateStability returns stable when alpha and beta cutoffs are omitted', () => {
    expect(
        calculateStability({
            currentVersion: '7.8.0',
        }),
    ).toBe('stable');
});

test('calculateStability defaults to stable when versions are invalid', () => {
    expect(
        calculateStability({
            alphaUntilVersion: '7.5.0',
            betaUntilVersion: '7.7.0',
            currentVersion: 'nope',
        }),
    ).toBe('stable');
});
