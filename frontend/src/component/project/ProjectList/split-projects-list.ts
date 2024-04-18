import type { IProjectCard } from 'interfaces/project';

const shouldDisplayInMyProjects =
    (myProjectIds: Set<string>) =>
    (project: IProjectCard): boolean =>
        project.favorite || myProjectIds.has(project.id);

export const splitProjectsList = (
    myProjects: Set<string>,
    filteredProjects: IProjectCard[],
) => {
    const my: IProjectCard[] = [];
    const other: IProjectCard[] = [];

    for (const project of filteredProjects) {
        if (shouldDisplayInMyProjects(myProjects)(project)) {
            my.push(project);
        } else {
            other.push(project);
        }
    }
    return { my, other };
};
