import { Counter as PromCounter, type CounterConfiguration } from 'prom-client';

/**
 * A wrapped instance of prom-client's Counter, overriding some of its methods for enhanced functionality and type-safety.
 */
export type Counter<T extends string = string> = {
    counter: PromCounter<T>;
    labels: (labels: Record<T, string | number>) => PromCounter.Internal;
    inc: (value?: number | undefined) => void;
    increment: (labels: Record<T, string | number>, value?: number) => void;
};

/**
 * Creates a wrapped instance of prom-client's Counter, overriding some of its methods for enhanced functionality and type-safety.
 *
 * @param options - The configuration options for the Counter, as defined in prom-client's CounterConfiguration.
 *               See prom-client documentation for detailed options: https://github.com/siimon/prom-client#counter
 * @returns An object containing the wrapped Counter instance and custom methods.
 */
export const createCounter = <T extends string>(
    options: CounterConfiguration<T>,
): Counter<T> => {
    /**
     * The underlying instance of prom-client's Counter.
     */
    const counter = new PromCounter<T>(options);

    /**
     * Applies given labels to the counter. Labels are key-value pairs.
     * This method wraps the original Counter's labels method for additional type-safety, requiring all configured labels to be specified.
     *
     * @param labels - An object where keys are label names and values are the label values.
     * @returns The Counter instance with the applied labels, allowing for method chaining.
     */
    const labels = (labels: Record<T, string | number>) =>
        counter.labels(labels);

    /**
     * Increments the counter by a specified value or by 1 if no value is provided.
     * Wraps the original Counter's inc method.
     *
     * @param value - (Optional) The value to increment the counter by. If not provided, defaults to 1.
     */
    const inc = (value?: number | undefined) => counter.inc(value);

    /**
     * A convenience method that combines setting labels and incrementing the counter.
     * Useful for incrementing with labels in a single call.
     *
     * @param labels - An object where keys are label names and values are the label values.
     * @param value - (Optional) The value to increment the counter by. If not provided, defaults to 1.
     */
    const increment = (labels: Record<T, string | number>, value?: number) =>
        counter.labels(labels).inc(value);

    return {
        counter,
        labels,
        inc,
        increment,
    };
};
