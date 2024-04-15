import type { IProjectCard } from 'interfaces/project';

export const shouldDisplayInMyProjects =
    (myProjectIds: Set<string>) =>
    (project: IProjectCard): boolean =>
        project.favorite || myProjectIds.has(project.id);
