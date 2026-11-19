import type { Registry } from '@prometheus-io/client';
import { SeriesLruCache } from './series-lru-cache.js';

export class SeriesLimiter {
    private registry: Registry;

    private seriesLruCache: SeriesLruCache;

    evictedSeries = 0;

    constructor(registry: Registry, maxSeries: number) {
        this.registry = registry;
        this.seriesLruCache = new SeriesLruCache(maxSeries);
    }

    track(name: string, labels: Record<string, string | number>): void {
        const evicted = this.seriesLruCache.touch(name, labels);
        if (evicted) {
            this.evictedSeries += 1;
        }
        if (evicted?.type === 'metric') {
            this.registry.removeSingleMetric(evicted.name);
        }
        if (evicted?.type === 'series') {
            this.registry.getSingleMetric(evicted.name)?.remove(evicted.labels);
        }
    }

    removeMetric(name: string): void {
        this.seriesLruCache.deleteMetric(name);
        this.registry.removeSingleMetric(name);
    }
}
