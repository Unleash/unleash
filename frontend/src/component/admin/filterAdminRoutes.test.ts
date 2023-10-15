import { filterAdminRoutes } from './filterAdminRoutes';

describe('filterAdminRoutes - open souce routes', () => {
    test('open source - should show menu item if mode paid plan mode is not defined', () => {
        expect(
            filterAdminRoutes(
                {},
                {
                    pro: false,
                    enterprise: false,
                    billing: false,
                },
            ),
        ).toBe(true);
    });

    test('open source - should not show menu item from paid plans', () => {
        const state = {
            pro: false,
            enterprise: false,
            billing: false,
        };

        expect(filterAdminRoutes({ mode: ['pro'] }, state)).toBe(false);
        expect(filterAdminRoutes({ mode: ['enterprise'] }, state)).toBe(false);
        expect(filterAdminRoutes({ mode: ['pro', 'enterprise'] }, state)).toBe(
            false,
        );
        expect(filterAdminRoutes({ billing: true }, state)).toBe(false);
    });

    test('pro - should show menu item for pro customers', () => {
        const state = {
            pro: true,
            enterprise: false,
            billing: false,
        };

        expect(filterAdminRoutes({ mode: ['pro'] }, state)).toBe(true);
        expect(filterAdminRoutes({ mode: ['pro', 'enterprise'] }, state)).toBe(
            true,
        );
        // This is to show enterprise badge in pro mode
        expect(filterAdminRoutes({ mode: ['enterprise'] }, state)).toBe(true);
    });

    test('enterprise - should show menu item if mode enterprise is defined or mode is undefined', () => {
        const state = {
            pro: false,
            enterprise: true,
            billing: false,
        };

        expect(filterAdminRoutes({ mode: ['enterprise'] }, state)).toBe(true);
        expect(filterAdminRoutes({ mode: ['pro', 'enterprise'] }, state)).toBe(
            true,
        );
        expect(filterAdminRoutes({ mode: ['pro'] }, state)).toBe(false);
    });

    test('billing - should show menu item if billing is defined', () => {
        expect(
            filterAdminRoutes(
                { mode: ['pro'], billing: true },
                {
                    pro: true,
                    enterprise: false,
                    billing: true,
                },
            ),
        ).toBe(true);
        expect(
            filterAdminRoutes(
                { mode: ['enterprise'], billing: true },
                {
                    pro: false,
                    enterprise: true,
                    billing: true,
                },
            ),
        ).toBe(true);
        expect(
            filterAdminRoutes(
                { mode: ['pro', 'enterprise'], billing: true },
                {
                    pro: true,
                    enterprise: false,
                    billing: true,
                },
            ),
        ).toBe(true);
        expect(
            filterAdminRoutes(
                { mode: ['pro'], billing: true },
                {
                    pro: false,
                    enterprise: false,
                    billing: true,
                },
            ),
        ).toBe(false);
    });
});
