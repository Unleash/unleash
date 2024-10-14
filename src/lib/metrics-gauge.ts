import { createGauge, type Gauge } from './util/metrics';

type RestrictedRecord<T extends string[]> = Record<T[number], string>;
type Query<R> = () => Promise<R | undefined | null>;
type MapResult<R> = (result: R) => {
    count: number;
    labels: RestrictedRecord<GaugeDefinition<R>['labelNames']>;
};

type GaugeDefinition<T> = {
    name: string;
    help: string;
    labelNames: string[];
    query: Query<T>;
    map: MapResult<T>;
};

export class DbMetricsMonitor {
    private tasks: (() => Promise<void>)[] = [];
    private gauges: Record<string, Gauge<string>> = {};

    constructor() {}

    registerGaugeDbMetric<T>(definition: GaugeDefinition<T>) {
        const gauge = createGauge(definition);
        this.gauges[definition.name] = gauge;
        this.tasks.push(async () => {
            const result = await definition.query();
            if (result) {
                const { count, labels } = definition.map(result);
                gauge.reset();
                gauge.labels(labels).set(count);
            }
        });
    }

    refreshDbMetrics = async () => {
        for (const task of this.tasks) {
            await task();
        }
    };

    async getLastValue(name: string): Promise<number | undefined> {
        try {
            return (await this.gauges[name].gauge.get()).values[0].value;
        } catch (e) {
            return undefined;
        }
    }
}
