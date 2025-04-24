import type { Db } from '../../../db/db';
import { MAX_UNKNOWN_FLAGS } from './unknown-flags-service';

const TABLE = 'unknown_flags';

export type UnknownFlag = {
    name: string;
    appName: string;
    seenAt: Date;
};

export interface IUnknownFlagsStore {
    replaceAll(flags: UnknownFlag[]): Promise<void>;
    getAll(): Promise<UnknownFlag[]>;
    clear(hoursAgo: number): Promise<void>;
    deleteAll(): Promise<void>;
}

export class UnknownFlagsStore implements IUnknownFlagsStore {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async replaceAll(flags: UnknownFlag[]): Promise<void> {
        await this.db.transaction(async (tx) => {
            await tx(TABLE).delete();
            if (flags.length > 0) {
                const rows = flags.map((flag) => ({
                    name: flag.name,
                    app_name: flag.appName,
                    seen_at: flag.seenAt,
                }));
                await tx(TABLE).insert(rows);
            }
        });
    }

    async getAll(): Promise<UnknownFlag[]> {
        const rows = await this.db(TABLE)
            .select('name', 'app_name', 'seen_at')
            .orderBy('seen_at', 'desc')
            .limit(MAX_UNKNOWN_FLAGS);
        return rows.map((row) => ({
            name: row.name,
            appName: row.app_name,
            seenAt: new Date(row.seen_at),
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
}
