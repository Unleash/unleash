import EventEmitter from 'events';
import { LogProvider, Logger } from '../../../logger';
import { DB_TIME } from '../../../metric-events';
import { Db } from '../../../server-impl';
import metricsHelper from '../../..//util/metrics-helper';
import { LastSeenInput } from './last-seen-service';
import { ILastSeenStore } from './types/last-seen-store-type';

// const LAST_SEEN_AT_COLUMNS = ['feature_name', 'environment', 'last_seen_at'];
const TABLE = 'last_seen_at_metrics';

export interface FeaturesTable {
    feature_name: string;
    last_seen_at: Date;
    environment: string;
}

export default class LastSeenStore implements ILastSeenStore {
    private db: Db;

    private logger: Logger;

    private timer: Function;

    constructor(db: Db, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('last-seen-store.ts');
        this.timer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'last-seen-environment-store',
                action,
            });
    }

    async setLastSeen(data: LastSeenInput[]): Promise<void> {
        const now = new Date();

        try {
            const inserts = data.map((item) => {
                return {
                    feature_name: item.featureName,
                    environment: item.environment,
                    last_seen_at: now,
                };
            });

            const batchSize = 1000;

            for (let i = 0; i < inserts.length; i += batchSize) {
                const batch = inserts.slice(i, i + batchSize);
                // Knex optimizes multi row insert when given an array:
                // https://knexjs.org/guide/query-builder.html#insert
                await this.db(TABLE)
                    .insert(batch)
                    .onConflict(['feature_name', 'environment'])
                    .merge();
            }
        } catch (err) {
            this.logger.error('Could not update lastSeen, error: ', err);
        }
    }
}

module.exports = LastSeenStore;
