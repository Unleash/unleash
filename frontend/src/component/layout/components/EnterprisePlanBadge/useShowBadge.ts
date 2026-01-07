import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import type { INavigationMenuItem } from 'interfaces/route';
import { useCallback } from 'react';

export const useShowBadge = () => {
    const { isPro } = useUiConfig();

    const showBadge = useCallback(
        (mode?: INavigationMenuItem['menu']['mode']) => {
            return !!(
                isPro() &&
                !mode?.includes('pro') &&
                mode?.includes('enterprise')
            );
        },
        [isPro],
    );
    return showBadge;
};
