import { expect, test } from 'vitest';
import { getInstanceName } from './getInstanceName.ts';

test('uses the last segment of the base path', () => {
    expect(getInstanceName('/enterprise')).toBe('enterprise');
    expect(getInstanceName('/eu/acme')).toBe('acme');
});

test('falls back to Unleash when there is no base path', () => {
    expect(getInstanceName('')).toBe('Unleash');
    expect(getInstanceName('/')).toBe('Unleash');
});
