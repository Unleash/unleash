import { calculateStability } from './api-operation.js';

test('calculateStability returns alpha when release is ahead of current', () => {
    expect(calculateStability('7.5.0', '7.4.0')).toBe('alpha');
});

test.each([
    ['7.4.0', '7.4.0'],
    ['7.3.0', '7.4.0'],
    ['7.2.0', '7.4.0'],
])('calculateStability returns beta for 0-2 minor versions ahead (release %s, current %s)', (releaseVersion, currentVersion) => {
    expect(calculateStability(releaseVersion, currentVersion)).toBe('beta');
});

test('calculateStability returns stable for 3+ minor versions ahead', () => {
    expect(calculateStability('7.1.0', '7.4.0')).toBe('stable');
});

test('calculateStability returns stable across major version differences', () => {
    expect(calculateStability('6.5.0', '7.0.0')).toBe('stable');
});

test('calculateStability defaults to stable when versions are invalid', () => {
    expect(calculateStability('not-a-version', '7.4.0')).toBe('stable');
    expect(calculateStability('7.4.0', 'nope')).toBe('stable');
});

test.each([
    ['7.5.0', '7.4.0-beta.1', 'alpha'],
    ['7.5.0', '7.4.0+build.123', 'alpha'],
    ['7.5.0', '7.4.0-beta.2+exp.sha.5114f85', 'alpha'],
    // pre-releases are always alpha
    ['7.5.0', '7.5.0-alpha.1', 'beta'],
    ['7.5.0', '7.5.0+build.123', 'beta'],
    ['7.5.0', '7.5.0-beta.2+exp.sha.5114f85', 'beta'],
    // on next patch release it moves to beta
    ['7.5.0', '7.5.1-beta.1', 'beta'],
    ['7.5.0', '7.5.1+build.123', 'beta'],
    ['7.5.0', '7.5.1-beta.2+exp.sha.5114f85', 'beta'],
])('calculateStability returns beta for 0-2 minor versions ahead (release %s, current %s)', (releaseVersion, currentVersion, expected) => {
    expect(calculateStability(releaseVersion, currentVersion)).toBe(expected);
});
