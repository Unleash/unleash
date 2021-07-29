import EventEmitter from 'events';
import { IClientMetric } from './client-metrics-db';
import { Store } from './store';

export interface IClientMetricsStore
    extends Store<IClientMetric, number>,
        EventEmitter {
    insert(metrics: IClientMetric): Promise<void>;
}
