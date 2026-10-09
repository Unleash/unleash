import { expect, test } from 'vitest';
import { getInstanceName } from './getInstanceName.ts';

test('uses the last base path segment, falling back to Unleash', () => {
    expect(getInstanceName('/enterprise')).toBe('enterprise');
    expect(getInstanceName('')).toBe('Unleash');
});
