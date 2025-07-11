import type { Db } from '../../../db/db.js';
import type { Logger, LogProvider } from '../../../logger.js';

const TABLE = 'unknown_flags';
const MAX_INSERT_BATCH_SIZE = 100;

export type UnknownFlag = {
    name: string;
    appName: string;
    seenAt: Date;
    environment: string;
};

export type QueryParams = {
    limit?: number;
    orderBy?: {
        column: string;
        order: 'asc' | 'desc';
    }[];
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

    private logger: Logger;

    constructor(db: Db, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('unknown-flags-store.ts');
    }

    async insert(flags: UnknownFlag[]): Promise<void> {
        if (!flags.length) return;

        const rows = flags.map(({ name, appName, seenAt, environment }) => ({
            name,
            app_name: appName,
            seen_at: seenAt,
            environment,
        }));

        for (let i = 0; i < rows.length; i += MAX_INSERT_BATCH_SIZE) {
            const chunk = rows.slice(i, i + MAX_INSERT_BATCH_SIZE);
            try {
                await this.db(TABLE)
                    .insert(chunk)
                    .onConflict(['name', 'app_name', 'environment'])
                    .merge(['seen_at']);
            } catch (error) {
                this.logger.debug(
                    `unknown_flags: batch ${i / MAX_INSERT_BATCH_SIZE + 1} failed and was skipped.`,
                    error,
                );
            }
        }
    }

    async getAll({ limit, orderBy }: QueryParams = {}): Promise<UnknownFlag[]> {
        let query = this.db(TABLE).select(
            'name',
            'app_name',
            'seen_at',
            'environment',
        );

        if (orderBy) {
            query = query.orderBy(orderBy);
        }

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
