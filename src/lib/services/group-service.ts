import type {
    ICreateGroupModel,
    IGroup,
    IGroupModel,
    IGroupProject,
    IGroupRole,
    IGroupUser,
} from '../types/group.js';
import {
    GroupDeletedEvent,
    GroupUpdatedEvent,
    SYSTEM_USER_AUDIT,
    type IAuditUser,
    type IUnleashConfig,
    type IUnleashStores,
} from '../types/index.js';
import type { IGroupStore } from '../types/stores/group-store.js';
import BadDataError from '../error/bad-data-error.js';
import { GROUP_CREATED, type IBaseEvent } from '../events/index.js';
import {
    GroupUserAdded,
    GroupUserRemoved,
    ScimGroupsDeleted,
} from '../types/index.js';
import NameExistsError from '../error/name-exists-error.js';
import type { IAccountStore } from '../types/stores/account-store.js';
import type { IUser } from '../types/user.js';
import type EventService from '../features/events/event-service.js';
import { SSO_SYNC_USER } from '../db/group-store.js';
import type { IGroupWithProjectRoles } from '../types/stores/access-store.js';
import { NotFoundError } from '../error/index.js';
import type { Logger } from '../logger.js';

const setsAreEqual = (firstSet, secondSet) =>
    firstSet.size === secondSet.size &&
    [...firstSet].every((x) => secondSet.has(x));

export class GroupService {
    private groupStore: IGroupStore;

    private eventService: EventService;

    private accountStore: IAccountStore;

    private logger: Logger;

    constructor(
        stores: Pick<IUnleashStores, 'groupStore' | 'accountStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
        eventService: EventService,
    ) {
        this.logger = getLogger('service/group-service.js');
        this.groupStore = stores.groupStore;
        this.eventService = eventService;
        this.accountStore = stores.accountStore;
    }

    async getAll(): Promise<IGroupModel[]> {
        this.logger.debug('Getting all groups');
        const groups = await this.groupStore.getAll();
        const allGroupUsers = await this.groupStore.getAllUsersByGroups(
            groups.map((g) => g.id),
        );
        const users = await this.accountStore.getAllWithId(
            allGroupUsers.map((u) => u.userId),
        );
        const groupProjects = await this.groupStore.getGroupProjects(
            groups.map((g) => g.id),
        );

        return groups.map((group) => {
            const mappedGroup = this.mapGroupWithUsers(
                group,
                allGroupUsers,
                users,
            );
            return this.mapGroupWithProjects(groupProjects, mappedGroup);
        });
    }

    async getAllWithId(ids: number[]) {
        return this.groupStore.getAllWithId(ids);
    }

    mapGroupWithProjects(
        groupProjects: IGroupProject[],
        group: IGroupModel,
    ): IGroupModel {
        return {
            ...group,
            projects: groupProjects
                .filter((project) => project.groupId === group.id)
                .map((project) => project.project),
        };
    }

    async getGroup(id: number): Promise<IGroupModel> {
        const group = await this.groupStore.get(id);
        if (group === undefined) {
            throw new NotFoundError(`Could not find group with id ${id}`);
        }
        const groupUsers = await this.groupStore.getAllUsersByGroups([id]);
        const users = await this.accountStore.getAllWithId(
            groupUsers.map((u) => u.userId),
        );
        return this.mapGroupWithUsers(group, groupUsers, users);
    }

    async isScimGroup(id: number): Promise<boolean> {
        const group = await this.groupStore.get(id);
        return Boolean(group?.scimId);
    }

    async createGroup(
        group: ICreateGroupModel,
        auditUser: IAuditUser,
    ): Promise<IGroup> {
        await this.validateGroup(group);

        const newGroup = await this.groupStore.create(group);

        if (group.users) {
            await this.groupStore.addUsersToGroup(
                newGroup.id,
                group.users,
                auditUser.username,
            );
        }

        const newUserIds = group.users?.map((g) => g.user.id);
        await this.eventService.storeEvent({
            type: GROUP_CREATED,
            createdBy: auditUser.username,
            createdByUserId: auditUser.id,
            ip: auditUser.ip,
            data: { ...group, users: newUserIds },
        });

        return newGroup;
    }

    async updateGroup(
        group: IGroupModel,
        auditUser: IAuditUser,
    ): Promise<IGroup> {
        const existingGroup = await this.groupStore.get(group.id);

        await this.validateGroup(group, existingGroup);

        const newGroup = await this.groupStore.update(group);

        const existingUsers = await this.groupStore.getAllUsersByGroups([
            group.id,
        ]);
        const existingUserIds = existingUsers.map((g) => g.userId);

        const deletableUsers = existingUsers.filter(
            (existingUser) =>
                !group.users.some(
                    (groupUser) => groupUser.user.id === existingUser.userId,
                ),
        );

        await this.groupStore.updateGroupUsers(
            newGroup.id,
            group.users.filter(
                (user) => !existingUserIds.includes(user.user.id),
            ),
            deletableUsers,
            auditUser.username,
        );

        const newUserIds = group.users.map((g) => g.user.id);
        await this.eventService.storeEvent(
            new GroupUpdatedEvent({
                data: { ...newGroup, users: newUserIds },
                preData: { ...existingGroup, users: existingUserIds },
                auditUser,
            }),
        );

        return newGroup;
    }

    async getProjectGroups(
        projectId: string,
    ): Promise<IGroupWithProjectRoles[]> {
        const projectGroups = await this.groupStore.getProjectGroups(projectId);

        if (projectGroups.length > 0) {
            const groups = await this.groupStore.getAllWithId(
                projectGroups.map((g) => g.id),
            );
            const groupUsers = await this.groupStore.getAllUsersByGroups(
                groups.map((g) => g.id),
            );
            const users = await this.accountStore.getAllWithId(
                groupUsers.map((u) => u.userId),
            );
            return groups.flatMap((group) => {
                return projectGroups
                    .filter((gr) => gr.id === group.id)
                    .map((groupRole) => ({
                        ...this.mapGroupWithUsers(group, groupUsers, users),
                        ...groupRole,
                    }));
            });
        }
        return [];
    }

    async deleteGroup(id: number, auditUser: IAuditUser): Promise<void> {
        const group = await this.groupStore.get(id);

        if (group === undefined) {
            /// Group was already deleted, or never existed, do nothing
            return;
        }
        const existingUsers = await this.groupStore.getAllUsersByGroups([
            group.id,
        ]);
        const existingUserIds = existingUsers.map((g) => g.userId);

        await this.groupStore.delete(id);

        await this.eventService.storeEvent(
            new GroupDeletedEvent({
                preData: { ...group, users: existingUserIds },
                auditUser,
            }),
        );
    }

    async validateGroup(
        group: IGroupModel | ICreateGroupModel,
        existingGroup?: IGroup,
    ): Promise<void> {
        if (!group.name) {
            throw new BadDataError('Group name cannot be empty');
        }

        if (!existingGroup || existingGroup.name !== group.name) {
            if (await this.groupStore.existsWithName(group.name)) {
                throw new NameExistsError('Group name already exists');
            }
        }

        if (existingGroup && Boolean(existingGroup.scimId)) {
            if (existingGroup.name !== group.name) {
                throw new BadDataError(
                    'Cannot update the name of a SCIM group',
                );
            }

            const existingUsers = new Set(
                (
                    await this.groupStore.getAllUsersByGroups([
                        existingGroup.id,
                    ])
                ).map((g) => g.userId),
            );

            const newUsers = new Set(group.users?.map((g) => g.user.id) || []);

            if (!setsAreEqual(existingUsers, newUsers)) {
                throw new BadDataError('Cannot update users of a SCIM group');
            }
        }
    }

    async getRolesForProject(projectId: string): Promise<IGroupRole[]> {
        return this.groupStore.getProjectGroupRoles(projectId);
    }

    async syncExternalGroups(
        userId: number,
        externalGroups: string[],
        _createdBy?: string, // deprecated
        _createdByUserId?: number, // deprecated
    ): Promise<void> {
        if (Array.isArray(externalGroups)) {
            const newGroups = await this.groupStore.getNewGroupsForExternalUser(
                userId,
                externalGroups,
            );
            await this.groupStore.addUserToGroups(
                userId,
                newGroups.map((g) => g.id),
                SSO_SYNC_USER,
            );
            const oldGroups = await this.groupStore.getOldGroupsForExternalUser(
                userId,
                externalGroups,
            );
            await this.groupStore.deleteUsersFromGroup(oldGroups);

            const events: IBaseEvent[] = [];
            for (const group of newGroups) {
                events.push(
                    new GroupUserAdded({
                        userId,
                        groupId: group.id,
                        auditUser: SYSTEM_USER_AUDIT,
                    }),
                );
            }

            for (const group of oldGroups) {
                events.push(
                    new GroupUserRemoved({
                        userId,
                        groupId: group.groupId,
                        auditUser: SYSTEM_USER_AUDIT,
                    }),
                );
            }

            await this.eventService.storeEvents(events);
        }
    }

    async deleteScimGroups(auditUser: IAuditUser): Promise<void> {
        await this.groupStore.deleteScimGroups();
        await this.eventService.storeEvent(
            new ScimGroupsDeleted({
                data: null,
                auditUser,
            }),
        );
    }

    private mapGroupWithUsers(
        group: IGroup,
        allGroupUsers: IGroupUser[],
        allUsers: IUser[],
    ): IGroupModel {
        const groupUsers = allGroupUsers.filter(
            (user) => user.groupId === group.id,
        );
        const groupUsersId = groupUsers.map((user) => user.userId);
        const selectedUsers = allUsers.filter((user) =>
            groupUsersId.includes(user.id),
        );
        const finalUsers = selectedUsers.map((user) => {
            const roleUser = groupUsers.find((gu) => gu.userId === user.id);
            return {
                user: user,
                joinedAt: roleUser?.joinedAt,
                createdBy: roleUser?.createdBy,
            };
        });
        return { ...group, users: finalUsers };
    }

    async getGroupsForUser(userId: number): Promise<IGroup[]> {
        return this.groupStore.getGroupsForUser(userId);
    }
}
