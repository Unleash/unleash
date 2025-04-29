import type { Db } from '../../db/db.js';
import { RoleName } from '../../types/index.js';
import { generateImageUrl } from '../../util/index.js';
import type {
    GroupProjectOwner,
    IProjectOwnersReadModel,
    ProjectOwners,
    ProjectOwnersDictionary,
    UserProjectOwner,
    WithProjectOwners,
} from './project-owners-read-model.type.js';

const T = {
    ROLE_USER: 'role_user',
    GROUP_ROLE: 'group_role',
    ROLES: 'roles',
    USERS: 'users',
};

export class ProjectOwnersReadModel implements IProjectOwnersReadModel {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    static addOwnerData<T extends { id: string }>(
        projects: T[],
        owners: ProjectOwnersDictionary,
    ): WithProjectOwners<T> {
        return projects.map((project) => ({
            ...project,
            owners: owners[project.id] || [{ ownerType: 'system' }],
        }));
    }

    private async getAllProjectUsersByRole(
        roleId: number,
    ): Promise<Record<string, UserProjectOwner[]>> {
        const usersResult = await this.db
            .select(
                'user.id',
                'user.username',
                'user.name',
                'user.email',
                'user.image_url',
                'ru.created_at',
                'ru.project',
            )
            .from(`${T.ROLE_USER} as ru`)
            .orderBy('ru.created_at', 'asc')
            .join(`${T.ROLES} as r`, 'ru.role_id', 'r.id')
            .where('r.id', roleId)
            .join(`${T.USERS} as user`, 'ru.user_id', 'user.id');
        const usersDict: Record<string, UserProjectOwner[]> = {};

        usersResult.forEach((user) => {
            const project = user.project as string;

            const data: UserProjectOwner = {
                ownerType: 'user',
                name: user?.name || user?.username || user?.email,
                email: user?.email,
                imageUrl: generateImageUrl(user),
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
            .orderBy('gr.created_at', 'asc')
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

    async getProjectOwnersDictionary(): Promise<ProjectOwnersDictionary> {
        const ownerRole = await this.db(T.ROLES)
            .where({ name: RoleName.OWNER })
            .first();
        const usersDict = await this.getAllProjectUsersByRole(ownerRole.id);
        const groupsDict = await this.getAllProjectGroupsByRole(ownerRole.id);

        const dict: Record<
            string,
            Array<UserProjectOwner | GroupProjectOwner>
        > = usersDict;

        Object.keys(groupsDict).forEach((project) => {
            if (project in dict) {
                dict[project] = dict[project].concat(groupsDict[project]);
            } else {
                dict[project] = groupsDict[project];
            }
        });

        return dict;
    }

    async getAllUserProjectOwners(
        projects?: Set<string>,
    ): Promise<UserProjectOwner[]> {
        const allOwners = await this.getProjectOwnersDictionary();

        const owners = projects
            ? Object.entries(allOwners)
                  .filter(([projectId]) => projects.has(projectId))
                  .map(([_, owners]) => owners)
            : Object.values(allOwners);

        const ownersDict = owners.flat().reduce(
            (acc, owner) => {
                if (owner.ownerType === 'user') {
                    acc[owner.email || owner.name] = owner;
                }
                return acc;
            },
            {} as Record<string, UserProjectOwner>,
        );
        return Object.values(ownersDict);
    }

    async addOwners<T extends { id: string }>(
        projects: T[],
    ): Promise<WithProjectOwners<T>> {
        const owners = await this.getProjectOwnersDictionary();

        return ProjectOwnersReadModel.addOwnerData(projects, owners);
    }

    async getProjectOwners(projectId: string): Promise<ProjectOwners> {
        const owners = await this.getProjectOwnersDictionary();
        return owners[projectId] ?? [{ ownerType: 'system' }];
    }
}
