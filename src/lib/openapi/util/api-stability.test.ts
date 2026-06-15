import { calculateStability } from './api-stability.js';

const currentVersion = '7.6.0';

test.each([
    {
        release: { beta: '7.6.5', stable: '7.7.0' } as const,
        expected: 'alpha',
    },
    {
        release: { beta: '7.5.0', stable: '7.7.0' } as const,
        expected: 'beta',
    },
    {
        release: { beta: '7.5.0', stable: '7.6.0' } as const,
        expected: 'stable',
    },
    {
        release: { beta: '7.7', stable: '7.8' } as const,
        expected: 'alpha',
    },
    {
        release: { beta: '7.6', stable: '7.8' } as const,
        expected: 'beta',
    },
    {
        release: { beta: '7.4', stable: '7.6' } as const,
        expected: 'stable',
    },
    {
        release: { beta: '8', stable: '9' } as const,
        expected: 'alpha',
    },
    {
        release: { beta: '7', stable: '8' } as const,
        expected: 'beta',
    },
    {
        release: { beta: '6', stable: '7' } as const,
        expected: 'stable',
    },
])(`${currentVersion} with $release should be $expected`, ({
    release,
    expected,
}) => {
    expect(calculateStability(release, currentVersion)).toBe(expected);
});

test.each([
    {
        release: { beta: '7.5.0', stable: '7.7.0' } as const,
    },
    {
        release: { beta: '7.4', stable: '7.6' } as const,
    },
    {
        release: { beta: '6', stable: '7' } as const,
    },
])(`defaults to stable when current version is invalid and $release`, ({
    release,
}) => {
    expect(calculateStability(release, 'invalid-current-version')).toBe(
        'stable',
    );
});

test.each([
    ['7.6.0', 'stable'],
    ['8.0.0', 'stable'],
    ['8.0.99', 'stable'],
    ['8.1.0', 'alpha'],
    ['8.2.0', 'alpha'],
] as const)('%s returns %s for legacy endpoints without release milestones', (version, expected) => {
    expect(calculateStability(undefined, version)).toBe(expected);
});

test.each([
    {
        release: { beta: '7.7.0' } as const,
        expected: 'alpha',
    },
    {
        release: { beta: '7.5.0' } as const,
        expected: 'beta',
    },
    {
        release: { beta: '7.7' } as const,
        expected: 'alpha',
    },
    {
        release: { beta: '7.4' } as const,
        expected: 'beta',
    },
    {
        release: { beta: '8' } as const,
        expected: 'alpha',
    },
    {
        release: { beta: '7' } as const,
        expected: 'beta',
    },
])(`${currentVersion} returns $expected with $release`, ({
    release,
    expected,
}) => {
    expect(calculateStability(release, currentVersion)).toBe(expected);
});

test.each([
    {
        release: { stable: '7.7.0' } as const,
        expected: 'alpha',
    },
    {
        release: { stable: '7.6.0' } as const,
        expected: 'stable',
    },
    {
        release: { stable: '7.7' } as const,
        expected: 'alpha',
    },
    {
        release: { stable: '7.6' } as const,
        expected: 'stable',
    },
    {
        release: { stable: '8' } as const,
        expected: 'alpha',
    },
    {
        release: { stable: '7' } as const,
        expected: 'stable',
    },
])(`${currentVersion} returns $expected with $release`, ({
    release,
    expected,
}) => {
    expect(calculateStability(release, currentVersion)).toBe(expected);
});

test(`${currentVersion} returns alpha when explicit alpha is set`, () => {
    const alphaOnly = {
        alpha: true as const,
    };
    expect(calculateStability(alphaOnly, currentVersion)).toBe('alpha');
});

test.each([
    {
        release: { beta: '7.6.0', stable: '7.5.0' } as const,
        expected: 'stable',
    },
    {
        release: { beta: '7.6', stable: '7.5' } as const,
        expected: 'stable',
    },
    {
        release: { beta: '8', stable: '7' } as const,
        expected: 'stable',
    },
])(`${currentVersion} treats invalid beta/stable ordering as stable-only cutoff. $release should be $expected`, ({
    release,
    expected,
}) => {
    expect(calculateStability(release, currentVersion)).toBe(expected);
});
