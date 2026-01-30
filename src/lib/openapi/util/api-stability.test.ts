import { calculateStability } from './api-stability.js';

test('calculateStability returns alpha when current is before alpha cutoff', () => {
    expect(
        calculateStability(
            {
                beta: '7.5.0',
                stable: '7.7.0',
            },
            '7.4.0',
        ),
    ).toBe('alpha');
});

test('calculateStability returns beta when current is between alpha and beta cutoffs', () => {
    expect(
        calculateStability(
            {
                beta: '7.5.0',
                stable: '7.7.0',
            },
            '7.6.0',
        ),
    ).toBe('beta');
});

test('calculateStability returns stable when current is at or after beta cutoff', () => {
    expect(
        calculateStability(
            {
                beta: '7.5.0',
                stable: '7.7.0',
            },
            '7.7.0',
        ),
    ).toBe('stable');
    expect(
        calculateStability(
            {
                beta: '7.5.0',
                stable: '7.7.0',
            },
            '7.8.0',
        ),
    ).toBe('stable');
});

test('calculateStability defaults to stable when versions are invalid', () => {
    expect(
        calculateStability(
            {
                beta: '7.5.0',
                stable: '7.7.0',
            },
            'nope',
        ),
    ).toBe('stable');
});

test('calculateStability returns stable for legacy endpoints without cutoffs before the default threshold', () => {
    expect(calculateStability(undefined, '7.6.0')).toBe('stable');
});

test('calculateStability returns alpha when both cutoffs are omitted after the default threshold', () => {
    expect(calculateStability(undefined, '7.8.0')).toBe('alpha');
});

test('calculateStability returns alpha before and beta at/after betaRelease when only beta is set', () => {
    const beta750 = {
        beta: '7.5.0' as const,
    };
    expect(calculateStability(beta750, '7.4.0')).toBe('alpha');
    expect(calculateStability(beta750, '7.5.0')).toBe('beta');
    expect(calculateStability(beta750, '7.6.0')).toBe('beta');
});

test('calculateStability returns alpha before and stable at/after stableRelease when only stable is set', () => {
    const stable760 = {
        stable: '7.6.0' as const,
    };
    expect(calculateStability(stable760, '7.5.0')).toBe('alpha');
    expect(calculateStability(stable760, '7.5.0')).toBe('alpha');
    expect(calculateStability(stable760, '7.6.0')).toBe('stable');
    expect(calculateStability(stable760, '7.7.0')).toBe('stable');
});

test('calculateStability treats invalid beta/stable ordering as stable-only cutoff', () => {
    const betaAfterStable = {
        beta: '7.6.0' as const,
        stable: '7.5.0' as const,
    };
    expect(calculateStability(betaAfterStable, '7.4.0')).toBe('alpha');
    expect(calculateStability(betaAfterStable, '7.5.0')).toBe('stable');
    expect(calculateStability(betaAfterStable, '7.6.0')).toBe('stable');
});
