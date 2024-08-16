import type { IProjectWithCount } from '../../types';
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
type ProjectOwners =
    | [SystemOwner]
    | Array<UserProjectOwner | GroupProjectOwner>;

export type ProjectOwnersDictionary = Record<string, ProjectOwners>;

export type IProjectForUiWithOwners = (ProjectForUi | IProjectWithCount) & {
    owners: ProjectOwners;
};

export interface IProjectOwnersReadModel {
    addOwners(
        projects: (ProjectForUi | IProjectWithCount)[],
        anonymizeProjectOwners?: boolean,
    ): Promise<IProjectForUiWithOwners[]>;
}
