import type { ProjectForUi } from './project-read-model-type';

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

export interface IProjectOwnersReadModel {
    addOwners(
        projects: ProjectForUi[],
        anonymizeProjectOwners?: boolean,
    ): Promise<IProjectForUiWithOwners[]>;
}
