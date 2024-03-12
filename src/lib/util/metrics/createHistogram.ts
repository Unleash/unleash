import {
    Histogram as PromHistogram,
    type HistogramConfiguration,
} from 'prom-client';

export type Histogram<T extends string = string> = {
    histogram: PromHistogram<T>;
    labels: (labels: Record<T, string | number>) => PromHistogram.Internal<T>;
    observe: (value: number) => void;
};

export const createHistogram = <T extends string>(
    options: HistogramConfiguration<T>,
): Histogram<T> => {
    const histogram = new PromHistogram(options);

    const labels = (labels: Record<T, string | number>) =>
        histogram.labels(labels);

    const observe = (value: number) => histogram.observe(value);

    return {
        histogram,
        labels,
        observe,
    };
};
