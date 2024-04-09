import type { Store } from '../../types/stores/store';
import type { Db, IUnleashConfig, Logger } from '../../server-impl';
import metricsHelper from '../../util/metrics-helper';
import { DB_TIME } from '../../metric-events';
import type { Row } from '../../db/crud/row-type';
import { defaultToRow } from '../../db/crud/default-mappings';

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
    private logger: Logger;
    protected readonly timer: (action: string) => Function;
    private db: Db;

    constructor(
        db: Db,
        config: Pick<IUnleashConfig, 'eventBus' | 'getLogger'>,
    ) {
        this.db = db;
        this.logger = config.getLogger('job-store');
        this.timer = (action: string) =>
            metricsHelper.wrapTimer(config.eventBus, DB_TIME, {
                store: TABLE,
                action,
            });
    }

    public async acquireBucket(
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

    public async update(
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

    public async get(pk: { name: string; bucket: Date }): Promise<JobModel> {
        const rows = await this.db(TABLE).select('*').where(pk);
        return rows[0];
    }

    getAll(query?: Object | undefined): Promise<JobModel[]> {
        throw new Error('Method not implemented.');
    }

    exists(key: { name: string; bucket: Date }): Promise<boolean> {
        throw new Error('Method not implemented.');
    }
    delete(key: { name: string; bucket: Date }): Promise<void> {
        throw new Error('Method not implemented.');
    }
    deleteAll(): Promise<void> {
        throw new Error('Method not implemented.');
    }
    destroy(): void {
        throw new Error('Method not implemented.');
    }
}
