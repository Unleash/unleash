import type { Logger, LogProvider } from '../../logger.js';

import type { Db } from '../../db/db.js';
import { rowToUser, USER_COLUMNS_PUBLIC, USERS_TABLE } from './user-store.js';
import type { User } from '../../internals.js';

export class UserUpdatesReadModel {
    private db: Db;

    private logger: Logger;

    constructor(db: Db, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('user-updates-read-model.ts');
    }

    async getLastUpdatedAt(): Promise<Date | null> {
        const result = await this.db(USERS_TABLE)
            .where({
                // also consider deleted users (different than activeUsers query)
                is_system: false,
                is_service: false,
            })
            .max('updated_at as last_updated_at')
            .first();
        return result ? result.last_updated_at : null;
    }

    async getUsersUpdatedAfter(
        date: Date,
        limit: number = 100,
    ): Promise<User[]> {
        const result = await this.db(USERS_TABLE)
            .where({
                // also consider deleted users (different than activeUsers query)
                is_system: false,
                is_service: false,
                updated_at: { $gt: date },
            })
            .orderBy('updated_at', 'asc')
            .select(USER_COLUMNS_PUBLIC)
            .limit(limit);
        return result.map(rowToUser);
    }
}
