import { expect, it } from 'vitest';
import { isVersionGreaterThanOrEqual } from './useMinimumUnleashVersion.ts';

it('treats a bare major as the .0.0 release of that major', () => {
    expect(isVersionGreaterThanOrEqual('8.0.0', '8')).toBe(true);
    expect(isVersionGreaterThanOrEqual('8.4.2', '8')).toBe(true);
    expect(isVersionGreaterThanOrEqual('7.6.5', '8')).toBe(false);
});

it('supports partial minimum versions down to the patch level', () => {
    expect(isVersionGreaterThanOrEqual('8.2.0', '8.2')).toBe(true);
    expect(isVersionGreaterThanOrEqual('8.1.0', '8.2')).toBe(false);
    expect(isVersionGreaterThanOrEqual('8.2.1', '8.2.1')).toBe(true);
});

it('counts a pre-release as lower than its release', () => {
    expect(isVersionGreaterThanOrEqual('8.0.0-beta.1', '8')).toBe(false);
});

it('returns false when either version is unparseable', () => {
    expect(isVersionGreaterThanOrEqual('not-a-version', '8')).toBe(false);
    expect(isVersionGreaterThanOrEqual('8.0.0', 'not-a-version')).toBe(false);
});
