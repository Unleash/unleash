import { isFeatureLimitReached } from './CreateFeature';

test('isFeatureLimitReached  should return false when featureLimit is null', async () => {
    expect(isFeatureLimitReached(null, 5)).toBe(false);
});

test('isFeatureLimitReached  should return false when featureLimit is undefined', async () => {
    expect(isFeatureLimitReached(undefined, 5)).toBe(false);
});

test('isFeatureLimitReached should return false when featureLimit is smaller current feature count', async () => {
    expect(isFeatureLimitReached(6, 5)).toBe(false);
});

test('isFeatureLimitReached should return true when featureLimit is smaller current feature count', async () => {
    expect(isFeatureLimitReached(4, 5)).toBe(true);
});

test('isFeatureLimitReached should return true when featureLimit is equal to current feature count', async () => {
    expect(isFeatureLimitReached(5, 5)).toBe(true);
});
