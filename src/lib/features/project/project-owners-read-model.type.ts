import type { ProjectForUi } from './project-read-model-type.js';

export type SystemOwner = { ownerType: 'system' };
export type UserProjectOwner = {
    ownerType: 'user';
    name: string;
    email?: string;
    imageUrl?: string;
};
export type GroupProjectOwner = {
    ownerType: 'group';
    name: string;
};
export type ProjectOwners =
    | [SystemOwner]
    | Array<UserProjectOwner | GroupProjectOwner>;

export type ProjectOwnersDictionary = Record<string, ProjectOwners>;

export type IProjectForUiWithOwners = ProjectForUi & {
    owners: ProjectOwners;
};

export type WithProjectOwners<T extends { id: string }> = (T & {
    owners: ProjectOwners;
})[];

export interface IProjectOwnersReadModel {
    addOwners<T extends { id: string }>(
        projects: T[],
    ): Promise<WithProjectOwners<T>>;

    getProjectOwners(projectId: string): Promise<ProjectOwners>;

    getAllUserProjectOwners(
        projects?: Set<string>,
    ): Promise<UserProjectOwner[]>;
}
