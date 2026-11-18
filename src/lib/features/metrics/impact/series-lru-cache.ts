import { LRUCache } from 'lru-cache';

export const MAX_IMPACT_METRIC_SERIES = 10_000;

type Labels = Record<string, string | number>;

type Series = { name: string; labels: Labels };

export type Evicted =
    | { type: 'series'; name: string; labels: Labels }
    | { type: 'metric'; name: string };

const keyOf = ({ name, labels }: Series) =>
    JSON.stringify([
        name,
        ...Object.keys(labels)
            .sort()
            .map((label) => [label, String(labels[label])]),
    ]);

export class SeriesLruCache {
    private cache: LRUCache<string, Series>;

    private seriesKeysByMetricName = new Map<string, Set<string>>();

    private lastEvicted: Evicted | undefined;

    constructor(maxSeries: number) {
        this.cache = new LRUCache({
            max: maxSeries,
            noDisposeOnSet: true,
            dispose: (series, key, reason) => {
                if (reason === 'evict') {
                    this.lastEvicted = this.forget(series, key);
                }
            },
        });
    }

    touch(name: string, labels: Labels): Evicted | undefined {
        const series = { name, labels };
        const key = keyOf(series);

        const keysOfMetric =
            this.seriesKeysByMetricName.get(name) ?? new Set<string>();
        keysOfMetric.add(key);
        this.seriesKeysByMetricName.set(name, keysOfMetric);

        this.lastEvicted = undefined;
        this.cache.set(key, series);
        return this.lastEvicted;
    }

    deleteMetric(name: string): void {
        for (const key of this.seriesKeysByMetricName.get(name) ?? []) {
            this.cache.delete(key);
        }
        this.seriesKeysByMetricName.delete(name);
    }

    private forget(series: Series, key: string): Evicted {
        const keysOfMetric = this.seriesKeysByMetricName.get(series.name);
        keysOfMetric?.delete(key);
        const seriesLeftInMetric = keysOfMetric?.size ?? 0;
        if (seriesLeftInMetric === 0) {
            this.seriesKeysByMetricName.delete(series.name);
            return { type: 'metric', name: series.name };
        }
        return { type: 'series', name: series.name, labels: series.labels };
    }
}
