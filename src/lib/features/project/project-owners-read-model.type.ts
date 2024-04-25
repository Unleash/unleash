import type { IProjectWithCount } from '../../types';

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

export type IProjectWithCountAndOwners = IProjectWithCount & {
    owners: ProjectOwners;
};

export interface IProjectOwnersReadModel {
    getAllProjectOwners(): Promise<ProjectOwnersDictionary>;
    addOwners(
        projects: IProjectWithCount[],
    ): Promise<IProjectWithCountAndOwners[]>;
}
