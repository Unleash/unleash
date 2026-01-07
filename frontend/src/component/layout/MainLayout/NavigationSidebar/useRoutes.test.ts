import { renderHook } from '@testing-library/react';
import { useRoutes } from './useRoutes.js';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';
import { type Mock, vi } from 'vitest';

vi.mock('hooks/api/getters/useUiConfig/useUiConfig');
vi.mock('hooks/api/getters/useInstanceStatus/useInstanceStatus');
vi.mock('component/menu/routes', () => ({
    getNavRoutes: () => [
        { path: '/features', title: 'Features', menu: { main: true } },
        {
            path: '/enterprise',
            title: 'Enterprise',
            menu: { main: true, mode: ['enterprise'] },
        },
        { path: '/pro', title: 'Pro', menu: { main: true, mode: ['pro'] } },
        {
            path: '/billing',
            title: 'Billing',
            menu: { main: true, billing: true },
        },
        {
            path: '/flagged-enterprise',
            title: 'Flagged Enterprise',
            menu: { main: true, mode: ['enterprise'] },
            flag: 'someFeatureFlag',
        },
    ],
    getPrimaryRoutes: () => [
        { path: '/overview', title: 'Overview', menu: { primary: true } },
        {
            path: '/admin',
            title: 'Admin',
            menu: { primary: true, mode: ['enterprise'] },
        },
    ],
}));

describe('useRoutes', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    test('filters routes based on enterprise access', () => {
        (useUiConfig as Mock).mockReturnValue({
            uiConfig: { flags: {} },
            isEnterprise: () => true,
            isPro: () => false,
        });
        (useInstanceStatus as Mock).mockReturnValue({
            isBilling: false,
        });

        const { result } = renderHook(() => useRoutes());

        expect(result.current.routes.mainNavRoutes).toHaveLength(2);
        expect(result.current.routes.mainNavRoutes[0].path).toBe('/features');
        expect(result.current.routes.mainNavRoutes[1].path).toBe('/enterprise');
    });

    test('filters routes based on pro access (still shows enterprise routes with badge)', () => {
        (useUiConfig as Mock).mockReturnValue({
            uiConfig: { flags: {} },
            isEnterprise: () => false,
            isPro: () => true,
        });
        (useInstanceStatus as Mock).mockReturnValue({
            isBilling: false,
        });

        const { result } = renderHook(() => useRoutes());

        expect(result.current.routes.mainNavRoutes).toHaveLength(3);
        expect(result.current.routes.mainNavRoutes[0].path).toBe('/features');
        expect(result.current.routes.mainNavRoutes[1].path).toBe('/enterprise');
        expect(result.current.routes.mainNavRoutes[2].path).toBe('/pro');
    });

    test('filters routes based on billing access', () => {
        (useUiConfig as Mock).mockReturnValue({
            uiConfig: { flags: {} },
            isEnterprise: () => false,
            isPro: () => false,
        });
        (useInstanceStatus as Mock).mockReturnValue({
            isBilling: true,
        });

        const { result } = renderHook(() => useRoutes());

        expect(result.current.routes.mainNavRoutes).toHaveLength(2);
        expect(result.current.routes.mainNavRoutes[0].path).toBe('/features');
        expect(result.current.routes.mainNavRoutes[1].path).toBe('/billing');
    });

    test('filters primary routes based on enterprise access', () => {
        (useUiConfig as Mock).mockReturnValue({
            uiConfig: { flags: {} },
            isEnterprise: () => true,
            isPro: () => false,
        });
        (useInstanceStatus as Mock).mockReturnValue({
            isBilling: false,
        });

        const { result } = renderHook(() => useRoutes());

        expect(result.current.routes.primaryRoutes).toHaveLength(2);
        expect(result.current.routes.primaryRoutes[0].path).toBe('/overview');
        expect(result.current.routes.primaryRoutes[1].path).toBe('/admin');
    });

    test('filters primary routes without enterprise access', () => {
        (useUiConfig as Mock).mockReturnValue({
            uiConfig: { flags: {} },
            isEnterprise: () => false,
            isPro: () => false,
        });
        (useInstanceStatus as Mock).mockReturnValue({
            isBilling: false,
        });

        const { result } = renderHook(() => useRoutes());

        expect(result.current.routes.primaryRoutes).toHaveLength(1);
        expect(result.current.routes.primaryRoutes[0].path).toBe('/overview');
    });

    test('does not show enterprise routes if not enterprise, even if feature flag is enabled', () => {
        (useUiConfig as Mock).mockReturnValue({
            uiConfig: { flags: { someFeatureFlag: true } },
            isEnterprise: () => false,
            isPro: () => false,
        });
        (useInstanceStatus as Mock).mockReturnValue({
            isBilling: false,
        });

        const { result } = renderHook(() => useRoutes());

        expect(result.current.routes.mainNavRoutes).toHaveLength(1);
        expect(result.current.routes.mainNavRoutes[0].path).toBe('/features');
        expect(
            result.current.routes.mainNavRoutes.find(
                (r) => r.path === '/flagged-enterprise',
            ),
        ).toBeUndefined();
    });

    test('shows enterprise routes with enabled feature flags when enterprise', () => {
        (useUiConfig as Mock).mockReturnValue({
            uiConfig: { flags: { someFeatureFlag: true } },
            isEnterprise: () => true,
            isPro: () => false,
        });
        (useInstanceStatus as Mock).mockReturnValue({
            isBilling: false,
        });

        const { result } = renderHook(() => useRoutes());

        expect(result.current.routes.mainNavRoutes).toHaveLength(3);
        expect(result.current.routes.mainNavRoutes[0].path).toBe('/features');
        expect(result.current.routes.mainNavRoutes[1].path).toBe('/enterprise');
        expect(result.current.routes.mainNavRoutes[2].path).toBe(
            '/flagged-enterprise',
        );
    });
});
