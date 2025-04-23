import type { INavigationMenuItem } from 'interfaces/route';

export type PlanData = {
    enterprise: boolean;
    pro: boolean;
    billing: boolean;
};

export const filterRoutesByPlanData = (
    menu: INavigationMenuItem['menu'],
    { pro, enterprise, billing }: PlanData,
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
