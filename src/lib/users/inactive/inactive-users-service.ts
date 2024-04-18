import {
    type IAuditUser,
    type IUnleashConfig,
    type IUnleashStores,
    serializeDates,
} from '../../types';
import type { IInactiveUsersStore } from './types/inactive-users-store-type';
import type { Logger } from '../../logger';
import type { InactiveUserSchema } from '../../openapi';
import type { UserService } from '../../services';
import { DAYS_TO_BE_COUNTED_AS_INACTIVE } from './createInactiveUsersService';

export class InactiveUsersService {
    private inactiveUsersStore: IInactiveUsersStore;
    private readonly logger: Logger;
    private userService: UserService;
    constructor(
        { inactiveUsersStore }: Pick<IUnleashStores, 'inactiveUsersStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
        services: {
            userService: UserService;
        },
    ) {
        this.logger = getLogger('services/client-feature-toggle-service.ts');
        this.inactiveUsersStore = inactiveUsersStore;
        this.userService = services.userService;
    }

    async getInactiveUsers(): Promise<InactiveUserSchema[]> {
        const users = await this.inactiveUsersStore.getInactiveUsers(
            DAYS_TO_BE_COUNTED_AS_INACTIVE,
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
