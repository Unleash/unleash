import { createGauge, type Gauge } from './util/metrics';

type RestrictedRecord<T extends readonly string[]> = Record<T[number], string>;
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

type Task = () => Promise<void>;
export class DbMetricsMonitor {
    private tasks: Set<Task> = new Set();
    private gauges: Map<string, Gauge<string>> = new Map();

    constructor() {}

    registerGaugeDbMetric<T>(definition: GaugeDefinition<T>): Task {
        const gauge = createGauge(definition);
        this.gauges.set(definition.name, gauge);
        const task = async () => {
            const result = await definition.query();
            if (result !== null && result !== undefined) {
                const { count, labels } = definition.map(result);
                gauge.reset();
                gauge.labels(labels).set(count);
            }
        };
        this.tasks.add(task);
        return task;
    }

    refreshDbMetrics = async () => {
        for (const task of this.tasks) {
            await task();
        }
    };

    async getLastValue(name: string): Promise<number | undefined> {
        const gauge = await this.gauges.get(name)?.gauge?.get();
        if (gauge && gauge.values.length > 0) {
            return gauge.values[0].value;
        }
        return undefined;
    }
}
