import type { Store } from '../../types/stores/store.js';
import type { Db, IUnleashConfig } from '../../types/index.js';
import metricsHelper from '../../util/metrics-helper.js';
import { DB_TIME } from '../../metric-events.js';
import type { Row } from '../../db/crud/row-type.js';
import { defaultToRow } from '../../db/crud/default-mappings.js';

export type JobModel = {
    name: string;
    bucket: Date;
    stage: 'started' | 'completed' | 'failed';
    finishedAt?: Date;
};

const TABLE = 'jobs';
const toRow = (data: Partial<JobModel>) =>
    defaultToRow<JobModel, Row<JobModel>>(data);

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
            })
            .onConflict(['name', 'bucket'])
            .ignore()
            .returning(['name', 'bucket']);

        endTimer();
        return bucket[0];
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
        return rows[0];
    }

    async get(pk: { name: string; bucket: Date }): Promise<JobModel> {
        const rows = await this.db(TABLE).where(pk);
        return rows[0];
    }

    async getAll(query?: Object | undefined): Promise<JobModel[]> {
        if (query) {
            return this.db(TABLE).where(query);
        }
        return this.db(TABLE);
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
