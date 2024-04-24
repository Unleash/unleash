import type { IProjectWithCount } from '../../types';

export type ProjectOwner =
    | {
          ownerType: 'user';
          name: string;
          email?: string;
          imageUrl?: string;
      }
    | {
          ownerType: 'group';
          name: string;
      };

export type ProjectOwnersDictionary = Record<string, ProjectOwner[]>;

//   const ownerRole = await this.accessService.getRoleByName(
//     RoleName.OWNER,
//    );
//   const ownerRoleId = ownerRole.id;

// async getAllProjectsUsersForRole(roleId: number): Promise<IUserWithProjectRoles[]> {
//     const rows = await this.db
//         .select(['user_id', 'ru.created_at', 'ru.project'])
//         .from<IRole>(`${T.ROLE_USER} AS ru`)
//         .join(`${T.ROLES} as r`, 'ru.role_id', 'id')
//         .where('r.id', roleId);

//     return rows.map((r) => ({
//         id: r.user_id,
//         addedAt: r.created_at,
//         projectId: r.project,
//         roleId,
//     }));
// }

// async getAllProjectsGroupsForRole(roleId: number): Promise<any[]> {
//     throw new Error('Method not implemented');
// }

type IProjectWithCountAndOwners = IProjectWithCount & {
    owners: ProjectOwner[];
};

const getAllProjectOwners = () => {};

const enrichWithOwners = (
    projects: IProjectWithCount[],
): IProjectWithCountAndOwners[] => {
    // const projectOwners: ProjectOwnersDictionary = getAllProjectOwners();

    // const projectsWithOwners = projects.map((p) => ({
    //     ...p,
    //     owners: projectOwners[p.id] || [],
    // }));

    return [];
};
