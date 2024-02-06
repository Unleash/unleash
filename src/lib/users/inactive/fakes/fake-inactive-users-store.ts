import {
    IInactiveUserRow,
    IInactiveUsersStore,
} from '../types/inactive-users-store-type';
import { IUser } from '../../../types';
import { subDays } from 'date-fns';

export class FakeInactiveUsersStore implements IInactiveUsersStore {
    private users: IUser[] = [];
    constructor(users?: IUser[]) {
        this.users = users ?? [];
    }
    getInactiveUsers(daysInactive: number): Promise<IInactiveUserRow[]> {
        return Promise.resolve(
            this.users
                .filter((user) => {
                    if (user.seenAt) {
                        return user.seenAt < subDays(new Date(), daysInactive);
                    } else if (user.createdAt) {
                        return (
                            user.createdAt < subDays(new Date(), daysInactive)
                        );
                    }
                })
                .map((user) => {
                    return {
                        id: user.id,
                        name: user.name,
                        username: user.username,
                        email: user.email,
                        seen_at: user.seenAt,
                        created_at: user.createdAt || new Date(),
                    };
                }),
        );
    }
}
