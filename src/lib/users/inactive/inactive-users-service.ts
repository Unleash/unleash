import {
    type IAuditUser,
    type IUnleashConfig,
    type IUnleashStores,
    serializeDates,
} from '../../types/index.js';
import type { IInactiveUsersStore } from './types/inactive-users-store-type.js';
import type { Logger } from '../../logger.js';
import type { InactiveUserSchema } from '../../openapi/index.js';
import type { IUnleashServices, UserService } from '../../services/index.js';

export interface InactiveUsers {
    totalInactiveUsers: number;
    inactiveUsers: InactiveUserSchema[];
}

export class InactiveUsersService {
    private inactiveUsersStore: IInactiveUsersStore;
    private readonly logger: Logger;
    private userService: UserService;
    private readonly userInactivityThresholdInDays: number;
    constructor(
        { inactiveUsersStore }: Pick<IUnleashStores, 'inactiveUsersStore'>,
        {
            getLogger,
            userInactivityThresholdInDays,
        }: Pick<IUnleashConfig, 'getLogger' | 'userInactivityThresholdInDays'>,
        { userService }: Pick<IUnleashServices, 'userService'>,
    ) {
        this.logger = getLogger('services/client-feature-toggle-service.ts');
        this.inactiveUsersStore = inactiveUsersStore;
        this.userService = userService;
        this.userInactivityThresholdInDays = userInactivityThresholdInDays;
    }

    async getInactiveUsers(
        offset: number = 0,
        limit: number = 50,
    ): Promise<InactiveUsers> {
        const users = await this.inactiveUsersStore.getInactiveUsers(
            this.userInactivityThresholdInDays,
            offset,
            limit,
        );
        if (users.length > 0) {
            const inactiveUsers = users.map((user) => {
                return serializeDates({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    seenAt: user.seen_at,
                    createdAt: user.created_at,
                    patSeenAt: user.pat_seen_at,
                });
            });
            return {
                inactiveUsers,
                totalInactiveUsers: users[0].total_inactive_users,
            };
        } else {
            return { inactiveUsers: [], totalInactiveUsers: 0 };
        }
    }

    async deleteInactiveUsers(
        calledByUser: IAuditUser,
        userIds: number[],
    ): Promise<void> {
        this.logger.info('Deleting inactive users');
        for (const userid of userIds) {
            if (calledByUser.id !== userid) {
                await this.userService.deleteUser(userid, calledByUser);
            }
        }
    }
}
