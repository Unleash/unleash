import {
    isLocalhostDomain,
    isVercelBranchDomain,
    isUnleashDomain,
} from 'utils/env';

test('isLocalhostDomain', () => {
    expect(isLocalhostDomain()).toEqual(true);
    expect(isLocalhostDomain('unleash-hosted.com')).toEqual(false);
});

test('isUnleashDomain', () => {
    expect(isUnleashDomain()).toEqual(false);
    expect(isUnleashDomain('vercel.app')).toEqual(false);
    expect(isUnleashDomain('app.getunleash.io')).toEqual(true);
    expect(isUnleashDomain('app.unleash-hosted.com')).toEqual(true);
});

test('isVercelBranchDomain', () => {
    expect(isVercelBranchDomain()).toEqual(false);
    expect(isVercelBranchDomain('getunleash.io')).toEqual(false);
    expect(isVercelBranchDomain('unleash-hosted.com')).toEqual(false);
    expect(isVercelBranchDomain('vercel.app')).toEqual(false);
    expect(isVercelBranchDomain('branch.vercel.app')).toEqual(true);
});
