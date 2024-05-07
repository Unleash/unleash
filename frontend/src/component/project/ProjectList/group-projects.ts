import type { IProjectCard } from 'interfaces/project';

export const groupProjects = (
    myProjectIds: Set<string>,
    filteredProjects: IProjectCard[],
) => {
    const mine: IProjectCard[] = [];
    const other: IProjectCard[] = [];

    for (const project of filteredProjects) {
        if (project.favorite || myProjectIds.has(project.id)) {
            mine.push(project);
        } else {
            other.push(project);
        }
    }
    return { myProjects: mine, otherProjects: other };
};
