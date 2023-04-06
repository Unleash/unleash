import useUiConfig from './api/getters/useUiConfig/useUiConfig';
import useProject from './api/getters/useProject/useProject';

const DEFAULT_STICKINESS = 'default';
export const useDefaultProjectSettings = (projectId: string) => {
    const { uiConfig } = useUiConfig();

    const { projectScopedStickiness } = uiConfig.flags;

    const { project, loading, error } = useProject(projectId);
    return {
        defaultStickiness: Boolean(projectScopedStickiness)
            ? project.defaultStickiness
            : DEFAULT_STICKINESS,
        mode: project.mode,
        loading: loading,
        error,
    };
};
