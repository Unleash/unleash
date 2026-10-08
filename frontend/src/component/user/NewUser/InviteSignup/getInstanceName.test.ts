import { expect, test } from 'vitest';
import { getInstanceName } from './getInstanceName.ts';

test('uses the last path segment of the instance url', () => {
    expect(getInstanceName('https://sandbox.getunleash.io/enterprise')).toBe(
        'enterprise',
    );
    expect(getInstanceName('https://eu.app.unleash-hosted.com/acme/')).toBe(
        'acme',
    );
});

test('falls back to Unleash when the url has no path or is missing', () => {
    expect(getInstanceName('http://localhost:4242')).toBe('Unleash');
    expect(getInstanceName(undefined)).toBe('Unleash');
    expect(getInstanceName('not a url')).toBe('Unleash');
});
