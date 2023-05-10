import useProject from './api/getters/useProject/useProject';

const DEFAULT_STICKINESS = 'default';
export const useDefaultProjectSettings = (projectId: string) => {
    const { project, loading, error } = useProject(projectId);
    return {
        defaultStickiness: Boolean(project.defaultStickiness)
            ? project.defaultStickiness
            : DEFAULT_STICKINESS,
        mode: project.mode,
        loading: loading,
        error,
    };
};
