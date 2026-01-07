import type { Db } from '../../db/db.js';
import type {
    IFeatureLink,
    IFeatureLinksReadModel,
} from './feature-links-read-model-type.js';
import metricsHelper from '../../util/metrics-helper.js';
import { DB_TIME } from '../../metric-events.js';
import type EventEmitter from 'events';
import memoizee from 'memoizee';
import { hoursToMilliseconds } from 'date-fns';

export class FeatureLinksReadModel implements IFeatureLinksReadModel {
    private db: Db;
    private timer: Function;
    private _getTopDomainsMemoized: () => Promise<
        { domain: string; count: number }[]
    >;

    constructor(db: Db, eventBus: EventEmitter) {
        this.db = db;
        this.timer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'feature_links',
                action,
            });

        this._getTopDomainsMemoized = memoizee(this._getTopDomains.bind(this), {
            promise: true,
            maxAge: hoursToMilliseconds(1),
        });
    }

    public getTopDomains(): Promise<{ domain: string; count: number }[]> {
        return this._getTopDomainsMemoized();
    }

    async _getTopDomains(): Promise<{ domain: string; count: number }[]> {
        const stopTimer = this.timer('getTopDomains');
        const topDomains = await this.db
            .from('feature_link')
            .select('domain')
            .count('* as count')
            .whereNotNull('domain')
            .groupBy('domain')
            .orderBy('count', 'desc')
            .limit(3);
        stopTimer();

        return topDomains.map(({ domain, count }) => ({
            domain,
            count: Number.parseInt(count, 10),
        }));
    }

    async getLinks(...features: string[]): Promise<IFeatureLink[]> {
        const links = await this.db
            .from('feature_link')
            .whereIn('feature_name', features)
            .orderBy('id', 'asc');

        return links.map((link) => ({
            id: link.id,
            url: link.url,
            title: link.title,
            feature: link.feature_name,
        }));
    }
}
