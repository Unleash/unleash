import { Db } from '../../../db/db';
import { ILastSeenReadModel } from './types/last-seen-read-model-type';

const TABLE = 'last_seen_at_metrics';

export class LastSeenAtReadModel implements ILastSeenReadModel {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async getForFeature(
        features: string[],
    ): Promise<{ lastSeen: Date; environment: string }[]> {
        const rows = await this.db(TABLE).whereIn('feature_name', features);

        console.log(rows);

        return [{ lastSeen: new Date(), environment: 'string' }];
    }
}
