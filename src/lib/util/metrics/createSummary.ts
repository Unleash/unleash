import { Summary as PromSummary, type SummaryConfiguration } from 'prom-client';

/**
 * A wrapped instance of prom-client's Summary, overriding some of its methods for enhanced functionality and type-safety.
 */
export type Summary<T extends string = string> = {
    summary: PromSummary<T>;
    labels: (labels: Record<T, string | number>) => PromSummary.Internal<T>;
    observe: (value: number) => void;
};

/**
 * Creates a wrapped instance of prom-client's Summary, overriding some of its methods for enhanced functionality and type-safety.
 *
 * @param options - The configuration options for the Summary, as defined in prom-client's SummaryConfiguration.
 *               See prom-client documentation for detailed options: https://github.com/siimon/prom-client#summary
 * @returns An object containing the wrapped Summary instance and custom methods.
 */
export const createSummary = <T extends string>(
    options: SummaryConfiguration<T>,
): Summary<T> => {
    /**
     * The underlying instance of prom-client's Summary.
     */
    const summary = new PromSummary(options);

    /**
     * Applies given labels to the summary. Labels are key-value pairs.
     * This method wraps the original Summary's labels method for additional type-safety, requiring all configured labels to be specified.
     *
     * @param labels - An object where keys are label names and values are the label values.
     * @returns The Summary instance with the applied labels, allowing for method chaining.
     */
    const labels = (labels: Record<T, string | number>) =>
        summary.labels(labels);

    /**
     * Observes a value in the summary.
     * Wraps the original Summary's observe method.
     *
     * @param value - The value to observe.
     */
    const observe = (value: number) => summary.observe(value);

    return {
        summary,
        labels,
        observe,
    };
};
