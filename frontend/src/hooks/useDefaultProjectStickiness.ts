import { getLocalStorageItem } from 'utils/storage';
import useUiConfig from './api/getters/useUiConfig/useUiConfig';
import { usePlausibleTracker } from './usePlausibleTracker';

const DEFAULT_STICKINESS = 'default';
export const useDefaultProjectStickiness = (projectId?: string) => {
    const { trackEvent } = usePlausibleTracker();
    const { uiConfig } = useUiConfig();

    const key = `defaultStickiness.${projectId}`;
    const { projectScopedStickiness } = uiConfig.flags;
    const projectStickiness = getLocalStorageItem<string>(key);

    const defaultStickiness =
        Boolean(projectScopedStickiness) &&
        projectStickiness != null &&
        projectId
            ? projectStickiness
            : DEFAULT_STICKINESS;

    const setDefaultProjectStickiness = (stickiness: string) => {
        if (
            Boolean(projectScopedStickiness) &&
            projectId &&
            stickiness !== ''
        ) {
            const key = `defaultStickiness.${projectId}`;
            localStorage.setItem(key, stickiness);
            trackEvent('project_stickiness_set');
        }
    };

    return {
        defaultStickiness,
        setDefaultProjectStickiness,
    };
};
