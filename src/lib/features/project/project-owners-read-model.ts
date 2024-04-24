import type { Db } from '../../db/db';
import { RoleName, type IProjectWithCount, type IRoleStore } from '../../types';

export type SystemOwner = { ownerType: 'system' };
export type NonSystemProjectOwner =
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

type ProjectOwners = [SystemOwner] | NonSystemProjectOwner[];

export type ProjectOwnersDictionary = Record<string, ProjectOwners>;

type IProjectWithCountAndOwners = IProjectWithCount & {
    owners: ProjectOwners;
};

export class ProjectOwnersReadModel {
    private db: Db;
    roleStore: IRoleStore;

    constructor(db: Db, roleStore: IRoleStore) {
        this.db = db;
        this.roleStore = roleStore;
    }

    addOwnerData(
        projects: IProjectWithCount[],
        owners: ProjectOwnersDictionary,
    ): IProjectWithCountAndOwners[] {
        // const projectsWithOwners = projects.map((p) => ({
        //     ...p,
        //     owners: projectOwners[p.id] || [],
        // }));
        return [];
    }

    async getAllProjectOwners(): Promise<ProjectOwnersDictionary> {
        const T = {
            ROLE_USER: 'role_user',
            GROUP_ROLE: 'group_role',
            ROLES: 'roles',
            USERS: 'users',
        };

        const ownerRole = await this.roleStore.getRoleByName(RoleName.OWNER);

        const query = this.db
            .select(
                'user.username',
                'user.name',
                'user.email',
                'user.image_url',
                'ru.created_at',
                'ru.project',
            )
            .from(`${T.ROLE_USER} as ru`)
            .join(`${T.ROLES} as r`, 'ru.role_id', 'r.id')
            .where('r.id', ownerRole.id)
            .join(`${T.USERS} as user`, 'ru.user_id', 'user.id');

        const result = await query;

        const dict = result.reduce((acc, next) => {
            const { project } = next;

            const userData = {
                ownerType: 'user',
                name: next?.name || next?.username,
                email: next?.email,
                imageUrl: next?.image_url,
            };

            if (project in acc) {
                acc[project].push(userData);
            } else {
                acc[project] = [userData];
            }
            return acc;
        }, {});

        return dict;
    }

    async enrichWithOwners(
        projects: IProjectWithCount[],
    ): Promise<IProjectWithCountAndOwners[]> {
        const owners = await this.getAllProjectOwners();

        return this.addOwnerData(projects, owners);
    }
}
