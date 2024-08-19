import type { TransitionalProjectData } from './project-read-model-type';

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
type ProjectOwners =
    | [SystemOwner]
    | Array<UserProjectOwner | GroupProjectOwner>;

export type ProjectOwnersDictionary = Record<string, ProjectOwners>;

export type IProjectForUiWithOwners = TransitionalProjectData & {
    owners: ProjectOwners;
};

export interface IProjectOwnersReadModel {
    addOwners(
        projects: TransitionalProjectData[],
        anonymizeProjectOwners?: boolean,
    ): Promise<IProjectForUiWithOwners[]>;
}
