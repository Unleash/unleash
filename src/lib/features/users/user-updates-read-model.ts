import type { LogProvider } from '../../logger.js';

import type { Db } from '../../db/db.js';
import { USER_COLUMNS_PUBLIC, USERS_TABLE } from './user-store.js';
import type { Row } from '../../db/crud/row-type.js';

type UpdatedUser = {
    id: number;
    name?: string;
    username?: string;
    email?: string;
    imageUrl?: string;
    seenAt?: Date;
    createdAt?: Date;
    updatedAt?: Date | null;
    deletedAt?: Date | null;
};
const toResponse = (row: Row<UpdatedUser>): UpdatedUser => {
    return {
        id: row.id,
        name: row.name,
        username: row.username,
        email: row.email,
        imageUrl: row.image_url,
        seenAt: row.seen_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        deletedAt: row.deleted_at,
    };
};
export class UserUpdatesReadModel {
    private db: Db;

    constructor(db: Db, _getLogger: LogProvider) {
        this.db = db;
    }

    async getLastUpdatedAt(): Promise<{
        lastUpdatedAt: Date;
        userId: number;
    } | null> {
        const result = await this.db(USERS_TABLE)
            .select('id', 'updated_at')
            .where({
                // also consider deleted users (different than activeUsers query)
                is_system: false,
                is_service: false,
            })
            .orderBy('updated_at', 'desc')
            .orderBy('id', 'desc')
            .first();
        return result
            ? {
                  lastUpdatedAt: result.updated_at,
                  userId: result.id,
              }
            : null;
    }

    /** @deprecated */
    async getUsersUpdatedAfter(
        date: Date,
        limit: number = 100,
    ): Promise<UpdatedUser[]> {
        return this.getUsersUpdatedAfterOrEqual(date, limit, 0);
    }

    async getUsersUpdatedAfterOrEqual(
        date: Date,
        limit: number = 100,
        afterId: number = 0,
    ): Promise<UpdatedUser[]> {
        const result = await this.db(USERS_TABLE)
            .where({
                // also consider deleted users (different than activeUsers query)
                is_system: false,
                is_service: false,
            })
            .where((builder) => {
                builder.where('updated_at', '>', date).orWhere((subBuilder) => {
                    subBuilder
                        .where('updated_at', '=', date)
                        .where('id', '>', afterId);
                });
            })
            .orderBy('updated_at', 'asc')
            .orderBy('id', 'asc')
            .select([
                ...USER_COLUMNS_PUBLIC,
                'created_at',
                'updated_at',
                'deleted_at',
            ])
            .limit(limit);
        return result.map(toResponse);
    }
}
