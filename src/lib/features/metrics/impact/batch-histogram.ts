import type { Registry } from 'prom-client';

interface BucketData {
    le: number | '+Inf';
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
    public labelNames: string[] = [];
    public bucketBoundaries: Set<number | '+Inf'> = new Set();

    // Store accumulated data for each label combination
    private store: Map<
        string,
        {
            count: number;
            sum: number;
            buckets: Map<number | '+Inf', number>;
        }
    > = new Map();

    constructor(config: {
        name: string;
        help: string;
        registry: Registry;
        labelNames?: string[];
    }) {
        this.name = config.name;
        this.help = config.help;
        this.registry = config.registry;
        this.labelNames = config.labelNames || [];

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
            this.bucketBoundaries.add(bucket.le);
        }
    }

    private createLabelKey(labels: Record<string, string | number>): string {
        const sortedKeys = Object.keys(labels).sort();
        return JSON.stringify(sortedKeys.map((key) => [key, labels[key]]));
    }

    reset(): void {
        this.store.clear();
        this.bucketBoundaries.clear();
    }

    get() {
        const values: any[] = [];

        for (const [labelKey, data] of this.store) {
            const labels: Record<string, string | number> = {};
            if (labelKey) {
                const parsedLabels = JSON.parse(labelKey);
                parsedLabels.forEach(
                    ([key, value]: [string, string | number]) => {
                        labels[key] = value;
                    },
                );
            }

            for (const [le, cumulativeCount] of Array.from(
                data.buckets.entries(),
            ).sort((a, b) => {
                // Sort buckets: numbers first (ascending), then '+Inf' last
                if (a[0] === '+Inf') return 1;
                if (b[0] === '+Inf') return -1;
                return (a[0] as number) - (b[0] as number);
            })) {
                values.push({
                    value: cumulativeCount,
                    labels: {
                        ...labels,
                        le: le.toString(),
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
