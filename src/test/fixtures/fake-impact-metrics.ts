import type { IImpactMetricsResolver } from '../../lib/types/index.js';

export const fakeImpactMetricsResolver = () => {
    const counters = new Map<string, { value: number; help: string }>();
    const gauges = new Map<string, { value: number; help: string }>();
    const histograms = new Map<
        string,
        { count: number; sum: number; help: string; buckets: number[] }
    >();

    const resolver: IImpactMetricsResolver = {
        defineCounter(name: string, help: string) {
            counters.set(name, { value: 0, help });
        },

        defineGauge(name: string, help: string) {
            gauges.set(name, { value: 0, help });
        },

        defineHistogram(name: string, help: string, buckets?: number[]) {
            const defaultBuckets = buckets || [
                0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10,
            ];
            histograms.set(name, {
                count: 0,
                sum: 0,
                help,
                buckets: defaultBuckets,
            });
        },

        incrementCounter(name: string, value: number = 1) {
            const counter = counters.get(name);

            if (!counter) {
                return;
            }

            counter.value += value;
            counters.set(name, counter);
        },

        updateGauge(name: string, value: number) {
            const gauge = gauges.get(name);

            if (!gauge) {
                return;
            }

            gauge.value = value;
            gauges.set(name, gauge);
        },

        observeHistogram(name: string, value: number) {
            const histogram = histograms.get(name);

            if (!histogram) {
                return;
            }

            histogram.count++;
            histogram.sum += value;
            histograms.set(name, histogram);
        },
    };

    return { ...resolver, counters, gauges, histograms };
};
