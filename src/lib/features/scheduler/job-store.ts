import type { Store } from '../../types/stores/store.js';
import type { Db, IUnleashConfig } from '../../types/index.js';
import metricsHelper from '../../util/metrics-helper.js';
import { DB_TIME } from '../../metric-events.js';
import type { Row } from '../../db/crud/row-type.js';
import {
    defaultFromRow,
    defaultToRow,
} from '../../db/crud/default-mappings.js';

export type JobModel = {
    name: string;
    bucket: Date;
    stage: 'started' | 'completed' | 'failed' | 'exhausted';
    attemptCount: number;
    leaseExpiresAt?: Date;
    finishedAt?: Date;
};

export type JobBucket = Pick<JobModel, 'name' | 'bucket' | 'attemptCount'>;

export type BucketAcquisition =
    | { status: 'acquired'; job: JobBucket }
    | { status: 'exhausted'; job: JobBucket };

const TABLE = 'jobs';
const toRow = (data: Partial<JobModel>) =>
    defaultToRow<JobModel, Row<JobModel>>(data);
const fromRow = (data: Row<JobModel>) =>
    defaultFromRow<JobModel, Row<JobModel>>(data) as JobModel;

export class JobStore
    implements Store<JobModel, { name: string; bucket: Date }>
{
    protected readonly timer: (action: string) => Function;
    private db: Db;

    constructor(
        db: Db,
        config: Pick<IUnleashConfig, 'eventBus' | 'getLogger'>,
    ) {
        this.db = db;
        this.timer = (action: string) =>
            metricsHelper.wrapTimer(config.eventBus, DB_TIME, {
                store: TABLE,
                action,
            });
    }

    async acquireBucket(
        key: string,
        bucketLengthInMinutes: number,
    ): Promise<{ name: string; bucket: Date } | undefined> {
        const endTimer = this.timer('acquireBucket');

        const bucket = await this.db<Row<JobModel>>(TABLE)
            .insert({
                name: key,
                // note: date_floor_round is a custom function defined in the DB
                bucket: this.db.raw(
                    `date_floor_round(now(), '${bucketLengthInMinutes} minutes')`,
                ),
                stage: 'started',
                attempt_count: 1,
                lease_expires_at: new Date(Date.now() + 10 * 60 * 1_000),
            })
            .onConflict(['name', 'bucket'])
            .ignore()
            .returning(['name', 'bucket']);

        endTimer();
        return bucket[0];
    }

    async acquireBucketAt(
        key: string,
        bucket: Date,
        {
            staleAfterMinutes = 10,
            maxAttempts = 5,
        }: { staleAfterMinutes?: number; maxAttempts?: number } = {},
    ): Promise<BucketAcquisition | undefined> {
        const inserted = await this.db<Row<JobModel>>(TABLE)
            .insert({
                name: key,
                bucket,
                stage: 'started',
                attempt_count: 1,
                lease_expires_at: new Date(
                    Date.now() + staleAfterMinutes * 60 * 1_000,
                ),
            })
            .onConflict(['name', 'bucket'])
            .ignore()
            .returning(['name', 'bucket', 'attempt_count']);

        if (inserted[0]) {
            return { status: 'acquired', job: this.toJobBucket(inserted[0]) };
        }

        const retried = await this.db<Row<JobModel>>(TABLE)
            .where({ name: key, bucket })
            .andWhere('attempt_count', '<', maxAttempts)
            .andWhere((builder) =>
                builder
                    .where('stage', 'failed')
                    .orWhere((started) =>
                        started
                            .where('stage', 'started')
                            .andWhere((expired) =>
                                expired
                                    .whereNull('lease_expires_at')
                                    .orWhere(
                                        'lease_expires_at',
                                        '<',
                                        new Date(),
                                    ),
                            ),
                    ),
            )
            .update({
                stage: 'started',
                attempt_count: this.db.raw('attempt_count + 1'),
                lease_expires_at: new Date(
                    Date.now() + staleAfterMinutes * 60 * 1_000,
                ),
                finished_at: this.db.raw('NULL'),
            })
            .returning(['name', 'bucket', 'attempt_count']);

        if (retried[0]) {
            return { status: 'acquired', job: this.toJobBucket(retried[0]) };
        }

        const exhausted = await this.db<Row<JobModel>>(TABLE)
            .where({ name: key, bucket })
            .andWhere('attempt_count', '>=', maxAttempts)
            .andWhere((builder) =>
                builder
                    .where('stage', 'failed')
                    .orWhere((started) =>
                        started
                            .where('stage', 'started')
                            .andWhere((expired) =>
                                expired
                                    .whereNull('lease_expires_at')
                                    .orWhere(
                                        'lease_expires_at',
                                        '<',
                                        new Date(),
                                    ),
                            ),
                    ),
            )
            .update({
                stage: 'exhausted',
                finished_at: new Date(),
            })
            .returning(['name', 'bucket', 'attempt_count']);

        if (exhausted[0]) {
            return {
                status: 'exhausted',
                job: this.toJobBucket(exhausted[0]),
            };
        }
    }

    async getLatestTerminalBucket(key: string): Promise<Date | undefined> {
        const row = await this.db<Row<JobModel>>(TABLE)
            .where({ name: key })
            .whereIn('stage', ['completed', 'exhausted'])
            .max('bucket as bucket')
            .first<{ bucket?: Date }>();

        return row?.bucket;
    }

    async getCurrentBucket(bucketLengthInMinutes: number): Promise<Date> {
        const result = await this.db.raw<{ rows: Array<{ bucket: Date }> }>(
            `SELECT date_floor_round(now(), '${bucketLengthInMinutes} minutes') AS bucket`,
        );
        return result.rows[0].bucket;
    }

    private toJobBucket(
        row: Pick<Row<JobModel>, 'name' | 'bucket' | 'attempt_count'>,
    ): JobBucket {
        return {
            name: row.name,
            bucket: row.bucket,
            attemptCount: row.attempt_count,
        };
    }

    async update(
        name: string,
        bucket: Date,
        data: Partial<Omit<JobModel, 'name' | 'bucket'>>,
    ): Promise<JobModel> {
        const rows = await this.db<Row<JobModel>>(TABLE)
            .update(toRow(data))
            .where({ name, bucket })
            .returning('*');
        return fromRow(rows[0]);
    }

    async get(pk: { name: string; bucket: Date }): Promise<JobModel> {
        const rows = await this.db<Row<JobModel>>(TABLE).where(pk);
        return fromRow(rows[0]);
    }

    async getAll(query?: Object | undefined): Promise<JobModel[]> {
        if (query) {
            const rows = await this.db<Row<JobModel>>(TABLE).where(query);
            return rows.map(fromRow);
        }
        const rows = await this.db<Row<JobModel>>(TABLE);
        return rows.map(fromRow);
    }

    async exists(key: { name: string; bucket: Date }): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1 FROM ${TABLE} WHERE name = ? AND bucket = ?) AS present`,
            [key.name, key.bucket],
        );
        const { present } = result.rows[0];
        return present;
    }

    async delete(key: { name: string; bucket: Date }): Promise<void> {
        await this.db(TABLE).where(key).delete();
    }

    async deleteAll(): Promise<void> {
        return this.db(TABLE).delete();
    }

    destroy(): void {}

    async count(): Promise<number> {
        return this.db(TABLE)
            .count()
            .then((res) => Number(res[0].count));
    }
}
