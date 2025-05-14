import type { Db } from '../../../db/db.js';
import type {
    IFeatureLastSeenResults,
    ILastSeenReadModel,
} from './types/last-seen-read-model-type.js';

const TABLE = 'last_seen_at_metrics';

export class LastSeenAtReadModel implements ILastSeenReadModel {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async getForFeature(features: string[]): Promise<IFeatureLastSeenResults> {
        const rows = await this.db(TABLE).whereIn('feature_name', features);

        const result = rows.reduce((acc, curr) => {
            if (!acc[curr.feature_name]) {
                acc[curr.feature_name] = {};

                acc[curr.feature_name][curr.environment] = {
                    lastSeen: curr.last_seen_at,
                };
            } else {
                acc[curr.feature_name][curr.environment] = {
                    lastSeen: curr.last_seen_at,
                };
            }

            return acc;
        }, {});

        return result;
    }
}
