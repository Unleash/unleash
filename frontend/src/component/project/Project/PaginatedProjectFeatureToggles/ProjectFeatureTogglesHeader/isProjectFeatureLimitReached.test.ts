import { isProjectFeatureLimitReached } from './useFlagLimits.js';

test('isFeatureLimitReached  should return false when featureLimit is null', async () => {
    expect(isProjectFeatureLimitReached(null, 5)).toBe(false);
});

test('isFeatureLimitReached  should return false when featureLimit is undefined', async () => {
    expect(isProjectFeatureLimitReached(undefined, 5)).toBe(false);
});

test('isFeatureLimitReached should return false when featureLimit is smaller current feature count', async () => {
    expect(isProjectFeatureLimitReached(6, 5)).toBe(false);
});

test('isFeatureLimitReached should return true when featureLimit is smaller current feature count', async () => {
    expect(isProjectFeatureLimitReached(4, 5)).toBe(true);
});

test('isFeatureLimitReached should return true when featureLimit is equal to current feature count', async () => {
    expect(isProjectFeatureLimitReached(5, 5)).toBe(true);
});
