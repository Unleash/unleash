import type { ProjectSchema } from 'openapi';

export const groupProjects = (
    myProjectIds: Set<string>,
    filteredProjects: ProjectSchema[],
) => {
    const mine: ProjectSchema[] = [];
    const other: ProjectSchema[] = [];

    for (const project of filteredProjects) {
        if (project.favorite || myProjectIds.has(project.id)) {
            mine.push(project);
        } else {
            other.push(project);
        }
    }
    return { myProjects: mine, otherProjects: other };
};
