import type { Db } from '../../db/db';
import type {
    IFeatureLink,
    IFeatureLinksReadModel,
} from './feature-links-read-model-type';
import metricsHelper from '../../util/metrics-helper';
import { DB_TIME } from '../../metric-events';
import type EventEmitter from 'events';

export class FeatureLinksReadModel implements IFeatureLinksReadModel {
    private db: Db;
    private timer: Function;

    constructor(db: Db, eventBus: EventEmitter) {
        this.db = db;
        this.timer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'feature_links',
                action,
            });
    }

    async getTopDomains(): Promise<{ domain: string; count: number }[]> {
        const stopTimer = this.timer('getTopDomains');
        const topDomains = await this.db
            .from('feature_link')
            .select('domain')
            .count('* as count')
            .whereNotNull('domain')
            .groupBy('domain')
            .orderBy('count', 'desc')
            .limit(20);
        stopTimer();

        return topDomains.map(({ domain, count }) => ({
            domain,
            count: Number.parseInt(count, 10),
        }));
    }

    async getLinks(feature: string): Promise<IFeatureLink[]> {
        const links = await this.db
            .from('feature_link')
            .where('feature_name', feature)
            .orderBy('id', 'asc');

        return links.map((link) => ({
            id: link.id,
            url: link.url,
            title: link.title,
        }));
    }
}
