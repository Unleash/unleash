import {
    type IAuditUser,
    type IUnleashConfig,
    type IUnleashStores,
    serializeDates,
} from '../../types/index.js';
import type { IInactiveUsersStore } from './types/inactive-users-store-type.js';
import type { Logger } from '../../logger.js';
import type { InactiveUserSchema } from '../../openapi/index.js';
import type { UserService } from '../../services/index.js';

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
        services: {
            userService: UserService;
        },
    ) {
        this.logger = getLogger('services/client-feature-toggle-service.ts');
        this.inactiveUsersStore = inactiveUsersStore;
        this.userService = services.userService;
        this.userInactivityThresholdInDays = userInactivityThresholdInDays;
    }

    async getInactiveUsers(): Promise<InactiveUserSchema[]> {
        const users = await this.inactiveUsersStore.getInactiveUsers(
            this.userInactivityThresholdInDays,
        );
        if (users.length > 0) {
            return users.map((user) => {
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
        } else {
            return [];
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
