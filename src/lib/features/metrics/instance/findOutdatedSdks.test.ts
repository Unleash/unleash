import { findOutdatedSDKs } from './findOutdatedSdks.js';

describe('findOutdatedSDKs', () => {
    it('should return an empty array when all SDKs are up to date', () => {
        const sdkVersions = [
            'unleash-client-node:6.0.0',
            'unleash-client-php:3.0.0',
        ];
        const result = findOutdatedSDKs(sdkVersions);
        expect(result).toEqual([]);
    });

    it('should return an array with outdated SDKs', () => {
        const sdkVersions = [
            'unleash-client-node:3.9.9',
            'unleash-client-php:0.9.9',
        ];
        const result = findOutdatedSDKs(sdkVersions);
        expect(result).toEqual([
            'unleash-client-node:3.9.9',
            'unleash-client-php:0.9.9',
        ]);
    });

    it('should ignore SDKs not in the config', () => {
        const sdkVersions = ['unleash-client-pony:2.0.0'];
        const result = findOutdatedSDKs(sdkVersions);
        expect(result).toEqual([]);
    });

    it('should handle and remove duplicate SDK versions', () => {
        const sdkVersions = [
            'unleash-client-node:3.8.0',
            'unleash-client-node:3.8.0',
            'unleash-client-php:0.9.0',
            'unleash-client-php:0.9.0',
        ];
        const result = findOutdatedSDKs(sdkVersions);
        expect(result).toEqual([
            'unleash-client-node:3.8.0',
            'unleash-client-php:0.9.0',
        ]);
    });

    it('should correctly handle semver versions', () => {
        const sdkVersions = [
            'unleash-client-node:6.1.0',
            'unleash-client-php:3.20.3-beta.0',
        ];
        const result = findOutdatedSDKs(sdkVersions);
        expect(result).toEqual([]);
    });

    it('should ignore invalid SDK versions', () => {
        const sdkVersions = [
            'unleash-client-node',
            '1.2.3',
            'unleash-client-node:0.0',
            'unleash-client-node:development',
            null,
        ];
        const result = findOutdatedSDKs(sdkVersions);
        expect(result).toEqual([]);
    });
});
