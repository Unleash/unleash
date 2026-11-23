import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useUiFlag } from 'hooks/useUiFlag';
import {
    type AppNavigationLink,
    appNavigationLinks,
} from './appNavigationLinks.ts';

export const useVisibleAppNavigationLinks = (): AppNavigationLink[] => {
    const { isOss, isEnterprise } = useUiConfig();
    const impactViewsEnabled = useUiFlag('impactViews');

    return [
        appNavigationLinks.home,
        ...(isEnterprise() ? [appNavigationLinks.changeRequests] : []),
        appNavigationLinks.projects,
        appNavigationLinks.flagsOverview,
        appNavigationLinks.playground,
        ...(isOss() ? [] : [appNavigationLinks.analytics]),
        ...(!isOss() && impactViewsEnabled
            ? [appNavigationLinks.impactViews]
            : []),
    ];
};
