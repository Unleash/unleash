import type { Db } from '../../db/db';
import { RoleName, type IProjectWithCount, type IRoleStore } from '../../types';

const T = {
    ROLE_USER: 'role_user',
    GROUP_ROLE: 'group_role',
    ROLES: 'roles',
    USERS: 'users',
};

type SystemOwner = { ownerType: 'system' };
type UserProjectOwner = {
    ownerType: 'user';
    name: string;
    email?: string;
    imageUrl?: string;
};
type GroupProjectOwner = {
    ownerType: 'group';
    name: string;
};
type ProjectOwners =
    | [SystemOwner]
    | Array<UserProjectOwner | GroupProjectOwner>;

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

    private async getAllProjectUsersByRole(
        roleId: number,
    ): Promise<Record<string, UserProjectOwner[]>> {
        const usersResult = await this.db
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
            .where('r.id', roleId)
            .join(`${T.USERS} as user`, 'ru.user_id', 'user.id');
        const usersDict: Record<string, UserProjectOwner[]> = {};

        usersResult.forEach((user) => {
            const project = user.project as string;

            const data: UserProjectOwner = {
                ownerType: 'user',
                name: user?.name || user?.username,
                email: user?.email,
                imageUrl: user?.image_url,
            };

            if (project in usersDict) {
                usersDict[project] = [...usersDict[project], data];
            } else {
                usersDict[project] = [data];
            }
        });

        return usersDict;
    }

    private async getAllProjectGroupsByRole(
        roleId: number,
    ): Promise<Record<string, GroupProjectOwner[]>> {
        const groupsResult = await this.db
            .select('groups.name', 'gr.created_at', 'gr.project')
            .from(`${T.GROUP_ROLE} as gr`)
            .join(`${T.ROLES} as r`, 'gr.role_id', 'r.id')
            .where('r.id', roleId)
            .join('groups', 'gr.group_id', 'groups.id');

        const groupsDict: Record<string, GroupProjectOwner[]> = {};

        groupsResult.forEach((group) => {
            const project = group.project as string;

            const data: GroupProjectOwner = {
                ownerType: 'group',
                name: group?.name,
            };

            if (project in groupsDict) {
                groupsDict[project] = [...groupsDict[project], data];
            } else {
                groupsDict[project] = [data];
            }
        });

        return groupsDict;
    }

    async getAllProjectOwners(): Promise<ProjectOwnersDictionary> {
        const ownerRole = await this.roleStore.getRoleByName(RoleName.OWNER);
        const usersDict = await this.getAllProjectUsersByRole(ownerRole.id);
        const groupsDict = await this.getAllProjectGroupsByRole(ownerRole.id);

        const projects = [
            ...new Set([...Object.keys(usersDict), ...Object.keys(groupsDict)]),
        ];

        const dict = Object.fromEntries(
            projects.map((project) => {
                return [
                    project,
                    [
                        ...(usersDict[project] || []),
                        ...(groupsDict[project] || []),
                    ],
                ];
            }),
        );

        return dict;
    }

    async enrichWithOwners(
        projects: IProjectWithCount[],
    ): Promise<IProjectWithCountAndOwners[]> {
        const owners = await this.getAllProjectOwners();

        return this.addOwnerData(projects, owners);
    }
}
