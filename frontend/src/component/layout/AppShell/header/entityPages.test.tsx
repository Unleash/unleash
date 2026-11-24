import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { expect, test } from 'vitest';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { findEntityPage, useEntityName } from './entityPages.ts';

const server = testServerSetup();

const wrapper = ({ children }: { children: ReactNode }) => (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
        {children}
    </SWRConfig>
);

const renderEntityName = (pathname: string) =>
    renderHook(() => useEntityName(findEntityPage(pathname)), { wrapper });

test.each([
    [
        '/projects/default/features/my-flag',
        '/projects/default/features/my-flag',
    ],
    [
        '/projects/default/features/my-flag/metrics',
        '/projects/default/features/my-flag',
    ],
    [
        '/projects/default/change-requests/7',
        '/projects/default/change-requests/7',
    ],
    ['/applications/checkout-service', '/applications/checkout-service'],
    [
        '/applications/checkout-service/instances',
        '/applications/checkout-service',
    ],
    ['/context/edit/region', '/context/edit/region'],
    ['/feature-toggle-type/edit/release', '/feature-toggle-type/edit/release'],
    ['/strategies/flexibleRollout', '/strategies/flexibleRollout'],
    ['/strategies/flexibleRollout/edit', '/strategies/flexibleRollout'],
    ['/environments/production', '/environments/production'],
    [
        '/release-templates/edit/01JB9GGTGQYEQ',
        '/release-templates/edit/01JB9GGTGQYEQ',
    ],
    ['/tag-types/edit/simple', '/tag-types/edit/simple'],
    ['/segments/edit/3', '/segments/edit/3'],
    ['/admin/users/5/edit', '/admin/users/5/edit'],
    ['/admin/users/5/access', '/admin/users/5/access'],
    ['/admin/groups/3', '/admin/groups/3'],
    ['/admin/groups/3/edit', '/admin/groups/3'],
])('links the entity of %s to %s', (pathname, to) => {
    expect(findEntityPage(pathname)?.to).toBe(to);
});

test.each([
    '/strategies/create',
    '/environments/create',
    '/admin/groups/create-group',
])('finds no entity on %s, which creates one', (pathname) => {
    expect(findEntityPage(pathname)).toBeUndefined();
});

test.each([
    '/projects/default',
    '/projects/default/change-requests',
    '/applications',
    '/context/create',
    '/segments',
    '/admin/users',
    '/profile',
])('finds no entity on %s', (pathname) => {
    expect(findEntityPage(pathname)).toBeUndefined();
});

test('keeps the entity link encoded', () => {
    expect(
        findEntityPage('/applications/checkout%20service/instances')?.to,
    ).toBe('/applications/checkout%20service');
});

test('keeps a param that cannot be decoded as it is', () => {
    expect(findEntityPage('/applications/100%')?.params.name).toBe('100%');
});

test.each([
    ['/projects/default/features/my-flag', 'my-flag'],
    ['/projects/default/features/my-flag/metrics', 'my-flag'],
    ['/applications/checkout%20service', 'checkout service'],
    ['/context/edit/region', 'region'],
    ['/strategies/flexibleRollout/edit', 'flexibleRollout'],
    ['/environments/production', 'production'],
    ['/tag-types/edit/simple', 'simple'],
])('names the entity of %s after its url: %s', (pathname, name) => {
    const { result } = renderEntityName(pathname);

    expect(result.current).toBe(name);
});

test.each([
    [
        '/projects/default/change-requests/7',
        '/api/admin/projects/default/change-requests/7',
        { title: 'Enable checkout' },
        'Enable checkout',
    ],
    [
        '/feature-toggle-type/edit/release',
        '/api/admin/feature-types',
        { types: [{ id: 'release', name: 'Release' }] },
        'Release',
    ],
    [
        '/segments/edit/3',
        '/api/admin/segments/3',
        { name: 'beta-users' },
        'beta-users',
    ],
    [
        '/admin/groups/3',
        '/api/admin/groups/3',
        { name: 'Developers' },
        'Developers',
    ],
    [
        '/admin/users/5/edit',
        '/api/admin/user-admin/5',
        { name: 'Jane Doe', username: 'jane', email: 'jane@example.com' },
        'Jane Doe',
    ],
    [
        '/admin/users/5/access',
        '/api/admin/user-admin/5',
        { name: 'Jane Doe', username: 'jane', email: 'jane@example.com' },
        'Jane Doe',
    ],
])('names the entity of %s once it has loaded', async (pathname, apiPath, response, name) => {
    testServerRoute(server, apiPath, response);

    const { result } = renderEntityName(pathname);

    expect(result.current).toBeUndefined();
    await waitFor(() => expect(result.current).toBe(name));
});

test('names the release template once it has loaded on enterprise', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: { current: { enterprise: 'version' } },
        environment: 'Enterprise',
    });
    testServerRoute(server, '/api/admin/release-plan-templates/01JB9GGTGQYEQ', {
        name: 'Gradual rollout',
    });

    const { result } = renderEntityName(
        '/release-templates/edit/01JB9GGTGQYEQ',
    );

    await waitFor(() => expect(result.current).toBe('Gradual rollout'));
});

test.each([
    ['jane', { username: 'jane', email: 'jane@example.com' }],
    ['jane@example.com', { email: 'jane@example.com' }],
])('names a user without a name after their username or email: %s', async (name, user) => {
    testServerRoute(server, '/api/admin/user-admin/5', user);

    const { result } = renderEntityName('/admin/users/5/edit');

    await waitFor(() => expect(result.current).toBe(name));
});

test('names no entity outside an entity page', () => {
    const { result } = renderEntityName('/segments');

    expect(result.current).toBeUndefined();
});
