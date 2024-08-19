import type { Db } from '../../db/db';
import { RoleName } from '../../types';
import { anonymise, generateImageUrl } from '../../util';
import type {
    GroupProjectOwner,
    IProjectOwnersReadModel,
    IProjectForUiWithOwners,
    ProjectOwnersDictionary,
    UserProjectOwner,
} from './project-owners-read-model.type';
import type { ProjectForUi } from './project-read-model-type';

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

    static addOwnerData(
        projects: ProjectForUi[],
        owners: ProjectOwnersDictionary,
    ): IProjectForUiWithOwners[] {
        return projects.map((project) => ({
            ...project,
            owners: owners[project.id] || [{ ownerType: 'system' }],
        }));
    }

    private async getAllProjectUsersByRole(
        roleId: number,
        anonymizeProjectOwners: boolean = false,
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

        const processSensitiveData = anonymizeProjectOwners
            ? anonymise
            : (x: string) => x;

        usersResult.forEach((user) => {
            const project = user.project as string;

            const data: UserProjectOwner = {
                ownerType: 'user',
                name: user?.name || user?.username,
                email: processSensitiveData(user?.email),
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

    async getAllProjectOwners(
        anonymizeProjectOwners: boolean = false,
    ): Promise<ProjectOwnersDictionary> {
        const ownerRole = await this.db(T.ROLES)
            .where({ name: RoleName.OWNER })
            .first();
        const usersDict = await this.getAllProjectUsersByRole(
            ownerRole.id,
            anonymizeProjectOwners,
        );
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

    async addOwners(
        projects: ProjectForUi[],
        anonymizeProjectOwners: boolean = false,
    ): Promise<IProjectForUiWithOwners[]> {
        const owners = await this.getAllProjectOwners(anonymizeProjectOwners);

        return ProjectOwnersReadModel.addOwnerData(projects, owners);
    }
}
