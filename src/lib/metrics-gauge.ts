import type { Logger } from './logger';
import type { IUnleashConfig } from './types';
import { createGauge, type Gauge } from './util/metrics';

type Query<R> = () => Promise<R | undefined | null>;
type MetricValue<L extends string> = {
    value: number;
    labels?: Record<L, string | number>;
};
type MapResult<R, L extends string> = (
    result: R,
) => MetricValue<L> | MetricValue<L>[];

type GaugeDefinition<T, L extends string> = {
    name: string;
    help: string;
    labelNames?: L[];
    query: Query<T>;
    map: MapResult<T, L>;
};

type Task = () => Promise<void>;

interface GaugeUpdater {
    target: Gauge<string>;
    task: Task;
}
export class DbMetricsMonitor {
    private updaters: Map<string, GaugeUpdater> = new Map();
    private log: Logger;

    constructor({ getLogger }: Pick<IUnleashConfig, 'getLogger'>) {
        this.log = getLogger('gauge-metrics');
    }

    private asArray<T>(value: T | T[]): T[] {
        return Array.isArray(value) ? value : [value];
    }

    registerGaugeDbMetric<T, L extends string>(
        definition: GaugeDefinition<T, L>,
    ): Task {
        const gauge = createGauge(definition);
        const task = async () => {
            try {
                const result = await definition.query();
                if (result !== null && result !== undefined) {
                    const results = this.asArray(definition.map(result));
                    gauge.reset();
                    for (const r of results) {
                        if (r.labels) {
                            gauge.labels(r.labels).set(r.value);
                        } else {
                            gauge.set(r.value);
                        }
                    }
                }
            } catch (e) {
                this.log.warn(`Failed to refresh ${definition.name}`, e);
            }
        };
        this.updaters.set(definition.name, { target: gauge, task });
        return task;
    }

    refreshDbMetrics = async () => {
        const tasks = Array.from(this.updaters.entries()).map(
            ([name, updater]) => ({ name, task: updater.task }),
        );
        for (const { name, task } of tasks) {
            this.log.debug(`Refreshing metric ${name}`);
            await task();
        }
    };

    async findValue(
        name: string,
        labels?: Record<string, string | number>,
    ): Promise<number | undefined> {
        const gauge = await this.updaters.get(name)?.target.gauge?.get();
        if (gauge && gauge.values.length > 0) {
            const values = labels
                ? gauge.values.filter(({ labels: l }) => {
                      return Object.entries(labels).every(
                          ([key, value]) => l[key] === value,
                      );
                  })
                : gauge.values;
            // return first value
            return values.map(({ value }) => value).shift();
        }
        return undefined;
    }
}
