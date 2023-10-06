import { Db } from '../../../db/db';
import { ILastSeenReadModel } from './types/last-seen-read-model-type';

const TABLE = 'last_seen_at_metrics';

export interface IFeatureLastSeenResults {
    [featureName: string]: {
        [environment: string]: {
            lastSeen: string;
        };
    };
}
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
