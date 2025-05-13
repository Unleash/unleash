import type { Logger } from './logger.js';
import type { IUnleashConfig } from './types/index.js';
import { createGauge, type Gauge } from './util/metrics/index.js';

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

    private async fetch<T, L extends string>(
        definition: GaugeDefinition<T, L>,
    ): Promise<MetricValue<L>[]> {
        const result = await definition.query();
        if (
            result !== undefined &&
            result !== null &&
            (!Array.isArray(result) || result.length > 0)
        ) {
            const resultArray = this.asArray(definition.map(result));
            resultArray
                .filter((r) => typeof r.value !== 'number')
                .forEach((r) => {
                    this.log.debug(
                        `Invalid value for ${definition.name}: ${r.value}. Value must be an number.`,
                    );
                });
            return resultArray.filter((r) => typeof r.value === 'number');
        }
        return [];
    }

    registerGaugeDbMetric<T, L extends string>(
        definition: GaugeDefinition<T, L>,
    ): Task {
        const gauge = createGauge(definition);
        const task = async () => {
            try {
                const results = await this.fetch(definition);
                if (results.length > 0) {
                    gauge.reset();
                    for (const r of results) {
                        // when r.value is zero, we are writing a zero value to the gauge which might not be what we want in some cases
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

    refreshMetrics = async () => {
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
