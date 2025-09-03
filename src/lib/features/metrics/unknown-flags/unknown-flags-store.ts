import type { Db } from '../../../db/db.js';
import type { Logger, LogProvider } from '../../../logger.js';

const TABLE = 'unknown_flags';
const TABLE_EVENTS = 'events';
const MAX_INSERT_BATCH_SIZE = 100;

type UnknownFlagEnvReport = {
    environment: string;
    seenAt: Date;
};

type UnknownFlagAppReport = {
    appName: string;
    environments: UnknownFlagEnvReport[];
};

export type UnknownFlag = {
    name: string;
    lastSeenAt: Date;
    lastEventAt?: Date;
    reports: UnknownFlagAppReport[];
};

export type UnknownFlagReport = {
    name: string;
    appName: string;
    lastSeenAt: Date;
    environment: string;
};

export type QueryParams = {
    limit?: number;
    orderBy?: {
        column: string;
        order: 'asc' | 'desc';
    }[];
};

type CountParams = {
    unique?: boolean;
};

export interface IUnknownFlagsStore {
    insert(flags: UnknownFlagReport[]): Promise<void>;
    getAll(params?: QueryParams): Promise<UnknownFlag[]>;
    clear(hoursAgo: number): Promise<void>;
    deleteAll(): Promise<void>;
    count(params?: CountParams): Promise<number>;
}

export class UnknownFlagsStore implements IUnknownFlagsStore {
    private db: Db;

    private logger: Logger;

    constructor(db: Db, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('unknown-flags-store.ts');
    }

    async insert(flags: UnknownFlagReport[]): Promise<void> {
        if (!flags.length) return;

        const rows = flags.map(
            ({ name, appName, lastSeenAt, environment }) => ({
                name,
                app_name: appName,
                seen_at: lastSeenAt,
                environment,
            }),
        );

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
        const base = this.db
            .with('base', (qb) =>
                qb
                    .from(`${TABLE} as uf`)
                    .leftJoin('features as f', 'f.name', 'uf.name')
                    .whereNull('f.name')
                    .select('uf.name', 'uf.app_name', 'uf.environment')
                    .max({ seen_at: 'uf.seen_at' })
                    .groupBy('uf.name', 'uf.app_name', 'uf.environment'),
            )
            .select(
                'b.name',
                this.db.raw('MAX(b.seen_at) as last_seen_at'),
                this.db.raw(
                    `(SELECT MAX(e.created_at) FROM ${TABLE_EVENTS} e WHERE e.feature_name = b.name) as last_event_at`,
                ),
                this.db.raw(`
        jsonb_object_agg(
          b.app_name,
          (
            SELECT jsonb_object_agg(env_row.environment, env_row.seen_at)
            FROM (
              SELECT environment, MAX(seen_at) AS seen_at
              FROM base
              WHERE name = b.name AND app_name = b.app_name
              GROUP BY environment
            ) env_row
          )
        ) as reports
      `),
            )
            .from('base as b')
            .groupBy('b.name');

        let q = base;
        if (orderBy) q = q.orderBy(orderBy);
        if (limit) q = q.limit(limit);

        const rows = await q;

        return rows.map((r) => {
            const reportsObj = r.reports ?? {};
            const reports = Object.entries(reportsObj).map(
                ([appName, envs]) => ({
                    appName,
                    environments: Object.entries(
                        envs as Record<string, Date>,
                    ).map(([environment, seenAt]) => ({
                        environment,
                        seenAt: new Date(seenAt),
                    })),
                }),
            );

            return {
                name: r.name,
                lastSeenAt: r.last_seen_at,
                lastEventAt: r.last_event_at,
                reports,
            };
        });
    }

    async clear(hoursAgo: number): Promise<void> {
        return this.db(TABLE)
            .whereRaw(`seen_at <= NOW() - INTERVAL '${hoursAgo} hours'`)
            .del();
    }

    async deleteAll(): Promise<void> {
        await this.db(TABLE).delete();
    }

    async count({ unique }: CountParams = {}): Promise<number> {
        const countQuery = unique
            ? this.db(TABLE).countDistinct({ count: 'name' }).first()
            : this.db(TABLE).count('* as count').first();

        const row = await countQuery;
        return Number(row?.count ?? 0);
    }
}
