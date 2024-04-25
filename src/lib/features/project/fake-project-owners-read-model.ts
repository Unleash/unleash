import type { IProjectWithCount } from '../../types';
import type {
    IProjectOwnersReadModel,
    IProjectWithCountAndOwners,
    ProjectOwnersDictionary,
} from './project-owners-read-model.type';

const T = {
    ROLE_USER: 'role_user',
    GROUP_ROLE: 'group_role',
    ROLES: 'roles',
    USERS: 'users',
};

export class FakeProjectOwnersReadModel implements IProjectOwnersReadModel {
    static addOwnerData(
        projects: IProjectWithCount[],
        _owners: ProjectOwnersDictionary,
    ): IProjectWithCountAndOwners[] {
        return projects.map((project) => ({
            ...project,
            owners: [{ ownerType: 'system' }],
        }));
    }

    async getAllProjectOwners(): Promise<ProjectOwnersDictionary> {
        return {};
    }

    async addOwners(
        projects: IProjectWithCount[],
    ): Promise<IProjectWithCountAndOwners[]> {
        return FakeProjectOwnersReadModel.addOwnerData(projects, {});
    }
}
