import { CRUDStore, type CrudStoreConfig } from '../../db/crud/crud-store.js';
import type { Row } from '../../db/crud/row-type.js';
import type { Db } from '../../db/db.js';
import type { IntegrationEventSchema } from '../../openapi/spec/integration-event-schema.js';

export type IntegrationEventWriteModel = Omit<
    IntegrationEventSchema,
    'id' | 'createdAt'
>;

export type IntegrationEventState = IntegrationEventWriteModel['state'];

export class IntegrationEventsStore extends CRUDStore<
    IntegrationEventSchema,
    IntegrationEventWriteModel,
    Row<IntegrationEventSchema>,
    Row<IntegrationEventWriteModel>,
    string
> {
    constructor(db: Db, config: CrudStoreConfig) {
        super('integration_events', db, config);
    }

    async getPaginatedEvents(
        id: number,
        limit: number,
        offset: number,
    ): Promise<IntegrationEventSchema[]> {
        const endTimer = this.timer('getPaginatedEvents');

        const rows = await this.db(this.tableName)
            .where('integration_id', id)
            .limit(limit)
            .offset(offset)
            .orderBy('id', 'desc');

        endTimer();

        return rows.map(this.fromRow) as IntegrationEventSchema[];
    }

    async cleanUpEvents(): Promise<void> {
        const endTimer = this.timer('cleanUpEvents');

        await this.db
            .with('latest_events', (qb) => {
                qb.select('id')
                    .from(this.tableName)
                    .whereRaw(`created_at >= now() - INTERVAL '2 hours'`)
                    .orderBy('id', 'desc')
                    .limit(100);
            })
            .with('latest_per_integration', (qb) => {
                qb.select(this.db.raw('MAX(id) as id'))
                    .from(this.tableName)
                    .groupBy('integration_id');
            })
            .from(this.tableName)
            .whereNotIn(
                'id',
                this.db
                    .select('id')
                    .from('latest_events')
                    .union(this.db.select('id').from('latest_per_integration')),
            )
            .delete();

        endTimer();
    }
}
