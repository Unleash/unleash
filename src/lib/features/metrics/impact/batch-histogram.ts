import type { Registry } from 'prom-client';

interface BucketData {
    le: number;
    count: number;
}

interface BatchData {
    count: number;
    sum: number;
    buckets: BucketData[];
}

export class BatchHistogram {
    private name: string;
    private help: string;
    private registry: Registry;

    // Store accumulated data for each label combination
    private store: Map<
        string,
        {
            count: number;
            sum: number;
            buckets: Map<number, number>;
        }
    > = new Map();

    constructor(config: {
        name: string;
        help: string;
        registry: Registry;
    }) {
        this.name = config.name;
        this.help = config.help;
        this.registry = config.registry;

        this.registry.registerMetric(this as any);
    }

    recordBatch(
        labels: Record<string, string | number>,
        data: BatchData,
    ): void {
        const labelKey = this.createLabelKey(labels);

        let entry = this.store.get(labelKey);
        if (!entry) {
            entry = {
                count: 0,
                sum: 0,
                buckets: new Map(),
            };
            this.store.set(labelKey, entry);
        }

        entry.count += data.count;
        entry.sum += data.sum;

        for (const bucket of data.buckets) {
            const current = entry.buckets.get(bucket.le) || 0;
            entry.buckets.set(bucket.le, current + bucket.count);
        }
    }

    private createLabelKey(labels: Record<string, string | number>): string {
        const sortedKeys = Object.keys(labels).sort();
        return sortedKeys.map((key) => `${key}:${labels[key]}`).join(',');
    }

    reset(): void {
        this.store.clear();
    }

    get() {
        const values: any[] = [];

        for (const [labelKey, data] of this.store) {
            const labels: Record<string, string | number> = {};
            if (labelKey) {
                labelKey.split(',').forEach((pair) => {
                    const [key, value] = pair.split(':');
                    labels[key] = value;
                });
            }

            for (const [le, cumulativeCount] of Array.from(
                data.buckets.entries(),
            ).sort((a, b) => a[0] - b[0])) {
                values.push({
                    value: cumulativeCount,
                    labels: {
                        ...labels,
                        le:
                            le === Number.POSITIVE_INFINITY
                                ? '+Inf'
                                : le.toString(),
                    },
                    metricName: `${this.name}_bucket`,
                });
            }

            values.push({
                value: data.sum,
                labels,
                metricName: `${this.name}_sum`,
            });

            values.push({
                value: data.count,
                labels,
                metricName: `${this.name}_count`,
            });
        }

        return {
            name: this.name,
            help: this.help,
            type: 'histogram',
            values,
            aggregator: 'sum',
        };
    }
}
