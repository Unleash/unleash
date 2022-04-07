import useProjects from 'hooks/api/getters/useProjects/useProjects';

const DEFAULT_PROJECT_ID = 'default';

export const useDefaultProjectId = (): string | undefined => {
    const { projects = [] } = useProjects();

    const defaultProject = projects.find(project => {
        return project.id === DEFAULT_PROJECT_ID;
    });

    return defaultProject?.id || projects[0]?.id;
};
