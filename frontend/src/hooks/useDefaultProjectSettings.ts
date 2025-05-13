import useProjectOverview from './api/getters/useProjectOverview/useProjectOverview.js';

const DEFAULT_STICKINESS = 'default';
export const useDefaultProjectSettings = (projectId: string) => {
    const { project, loading, error } = useProjectOverview(projectId);
    return {
        defaultStickiness: project.defaultStickiness
            ? project.defaultStickiness
            : DEFAULT_STICKINESS,
        mode: project.mode,
        loading: loading,
        error,
    };
};
