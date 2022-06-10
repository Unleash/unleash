import useProjects from 'hooks/api/getters/useProjects/useProjects';

export const DEFAULT_PROJECT_ID = 'default';

// Get the default project ID, or the first ID if there is no default project.
export const useDefaultProjectId = (): string | undefined => {
    const { projects = [] } = useProjects();

    const defaultProject = projects.find(project => {
        return project.id === DEFAULT_PROJECT_ID;
    });

    return defaultProject?.id || projects[0]?.id;
};
