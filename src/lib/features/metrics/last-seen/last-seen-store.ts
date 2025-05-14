import type EventEmitter from 'events';
import type { LogProvider, Logger } from '../../../logger.js';
import { DB_TIME } from '../../../metric-events.js';
import type { Db } from '../../../types/index.js';
import metricsHelper from '../../../util/metrics-helper.js';
import type { LastSeenInput } from './last-seen-service.js';
import type { ILastSeenStore } from './types/last-seen-store-type.js';

const TABLE = 'last_seen_at_metrics';

const prepareLastSeenInput = (data: LastSeenInput[]) => {
    const now = new Date();

    const sortedData = data.sort(
        (a, b) =>
            a.featureName.localeCompare(b.featureName) ||
            a.environment.localeCompare(b.environment),
    );

    const inserts = sortedData.map((item) => {
        return {
            feature_name: item.featureName,
            environment: item.environment,
            last_seen_at: now,
        };
    });

    return inserts;
};

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
        try {
            const inserts = prepareLastSeenInput(data);
            const batchSize = 500;

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

    async cleanLastSeen() {
        await this.db(TABLE)
            .whereNotIn('feature_name', this.db.select('name').from('features'))
            .or.whereNotIn(
                'environment',
                this.db.select('name').from('environments'),
            )
            .del();
    }
}
