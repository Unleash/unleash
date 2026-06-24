import { expect, test } from 'vitest';
import { isHiddenRoute } from './AccessRequestsNotifications';

test('hides on /admin/users and nested paths', () => {
    expect(isHiddenRoute('/admin/users')).toBe(true);
    expect(isHiddenRoute('/admin/users/')).toBe(true);
    expect(isHiddenRoute('/admin/users/123')).toBe(true);
});

test('hides on prefixed deployments like /hosted/admin/users', () => {
    expect(isHiddenRoute('/hosted/admin/users')).toBe(true);
    expect(isHiddenRoute('/hosted/admin/users/123')).toBe(true);
    expect(isHiddenRoute('/someinstance-123/admin/users')).toBe(true);
    expect(isHiddenRoute('/someinstance-123/admin/users/123')).toBe(true);
});

test('does not hide on unrelated routes', () => {
    expect(isHiddenRoute('/')).toBe(false);
    expect(isHiddenRoute('/features')).toBe(false);
    expect(isHiddenRoute('/admin')).toBe(false);
    expect(isHiddenRoute('/admin/api')).toBe(false);
    expect(isHiddenRoute('/hosted/features')).toBe(false);
});
