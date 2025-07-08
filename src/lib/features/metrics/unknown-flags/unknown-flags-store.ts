import type { Db } from '../../../db/db.js';

const TABLE = 'unknown_flags';

export type UnknownFlag = {
    name: string;
    appName: string;
    seenAt: Date;
    environment: string;
};

export type QueryParams = {
    limit?: number;
};

export interface IUnknownFlagsStore {
    insert(flags: UnknownFlag[]): Promise<void>;
    getAll(params?: QueryParams): Promise<UnknownFlag[]>;
    clear(hoursAgo: number): Promise<void>;
    deleteAll(): Promise<void>;
    count(): Promise<number>;
}

export class UnknownFlagsStore implements IUnknownFlagsStore {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async insert(flags: UnknownFlag[]): Promise<void> {
        if (flags.length > 0) {
            const rows = flags.map((flag) => ({
                name: flag.name,
                app_name: flag.appName,
                seen_at: flag.seenAt,
                environment: flag.environment,
            }));
            await this.db(TABLE)
                .insert(rows)
                .onConflict(['name', 'app_name', 'environment'])
                .merge(['seen_at']);
        }
    }

    async getAll({ limit }: QueryParams = {}): Promise<UnknownFlag[]> {
        let query = this.db(TABLE).select(
            'name',
            'app_name',
            'seen_at',
            'environment',
        );

        if (limit) {
            query = query.limit(limit);
        }

        const rows = await query;

        return rows.map((row) => ({
            name: row.name,
            appName: row.app_name,
            seenAt: new Date(row.seen_at),
            environment: row.environment,
        }));
    }

    async clear(hoursAgo: number): Promise<void> {
        return this.db(TABLE)
            .whereRaw(`seen_at <= NOW() - INTERVAL '${hoursAgo} hours'`)
            .del();
    }

    async deleteAll(): Promise<void> {
        await this.db(TABLE).delete();
    }

    async count(): Promise<number> {
        const row = await this.db(TABLE).count('* as count').first();
        return Number(row?.count ?? 0);
    }
}
