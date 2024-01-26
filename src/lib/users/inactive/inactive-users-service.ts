import {
    IUnleashConfig,
    IUnleashStores,
    IUser,
    serializeDates,
} from '../../types';
import { IInactiveUsersStore } from './types/inactive-users-store-type';
import { Logger } from '../../logger';
import { InactiveUserSchema } from '../../openapi';
import { UserService } from '../../services';

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
        this.logger.debug('Getting inactive users');
        const users = await this.inactiveUsersStore.getInactiveUsers(180);
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

    async deleteInactiveUsers(calledByUser: IUser): Promise<void> {
        this.logger.info('Deleting inactive users');
        const users = await this.inactiveUsersStore.getInactiveUsers(180);
        for (const userToDelete of users) {
            await this.userService.deleteUser(userToDelete.id, calledByUser);
        }
    }
}
