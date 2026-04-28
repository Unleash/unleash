import { describe, expect, it } from 'vitest';
import { buildSdkApiUrl } from './buildSdkApiUrl.ts';

describe('buildSdkApiUrl', () => {
    it('returns the client API URL for server SDKs', () => {
        expect(buildSdkApiUrl('https://unleash.example', 'Node.js')).toBe(
            'https://unleash.example/api/',
        );
        expect(buildSdkApiUrl('https://unleash.example', 'Python')).toBe(
            'https://unleash.example/api/',
        );
    });

    it('returns the frontend API URL for client SDKs', () => {
        expect(buildSdkApiUrl('https://unleash.example', 'React')).toBe(
            'https://unleash.example/api/frontend/',
        );
        expect(buildSdkApiUrl('https://unleash.example', 'JavaScript')).toBe(
            'https://unleash.example/api/frontend/',
        );
    });
});
