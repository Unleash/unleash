import type { INavigationMenuItem } from 'interfaces/route';

export const filterAdminRoutes = (
    menu: INavigationMenuItem['menu'],
    {
        pro,
        enterprise,
        billing,
    }: { pro?: boolean; enterprise?: boolean; billing?: boolean },
): boolean => {
    const mode = menu?.mode;
    if (menu?.billing && !billing) return false;

    if (!mode || mode.length === 0) {
        return true;
    }

    if (pro) {
        if (mode.includes('pro')) {
            return true;
        }

        if (mode.includes('enterprise')) {
            return true;
        }
    }

    if (enterprise && mode.includes('enterprise')) {
        return true;
    }

    return false;
};
