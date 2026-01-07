import { Gauge as PromGauge, type GaugeConfiguration } from 'prom-client';

/**
 * A wrapped instance of prom-client's Gauge, overriding some of its methods for enhanced functionality and type-safety.
 */
export type Gauge<T extends string = string> = {
    gauge: PromGauge<T>;
    labels: (labels: Record<T, string | number>) => PromGauge.Internal<T>;
    reset: () => void;
    set: (value: number) => void;
};

/**
 * Additional options for createGauge that allow registering a lazy collect function
 * which caches values for a given TTL.
 */
export type CreateGaugeOptions<T extends string> = GaugeConfiguration<T> & {
    /**
     * Time to live for cached values in milliseconds. Used together with `fetchValue`.
     */
    ttlMs?: number;
    /**
     * Optional fetcher used to populate the gauge value lazily on scrape.
     * If provided together with `ttlMs`, a `collect` function will be installed that
     * caches the value for the TTL. Return null to indicate unknown (we'll set NaN).
     */
    fetchValue?: () => Promise<number | null>;
};

/**
 * Creates a wrapped instance of prom-client's Gauge, overriding some of its methods for enhanced functionality and type-safety.
 *
 * @param options - The configuration options for the Gauge, as defined in prom-client's GaugeConfiguration.
 *               See prom-client documentation for detailed options: https://github.com/siimon/prom-client#gauge
 * @returns An object containing the wrapped Gauge instance and custom methods.
 */
export const createGauge = <T extends string>(
    options: CreateGaugeOptions<T>,
): Gauge<T> => {
    const { ttlMs, fetchValue, ...gaugeOptions } =
        options as CreateGaugeOptions<T>;

    // If fetchValue is provided, attach a TTL-cached collect. We preserve any existing collect
    // by calling it afterwards.
    if (fetchValue && typeof fetchValue === 'function') {
        const ttl =
            typeof ttlMs === 'number' && Number.isFinite(ttlMs) ? ttlMs : 0;
        const last: { ts: number; value: number | null } = {
            ts: 0,
            value: null,
        };
        const originalCollect = (gaugeOptions as GaugeConfiguration<T>).collect;

        // Assign a custom collect that obeys TTL caching semantics
        (gaugeOptions as GaugeConfiguration<T>).collect = async function (
            this: PromGauge<T>,
        ) {
            const now = Date.now();
            const fresh = ttl > 0 && now - last.ts < ttl && last.value !== null;

            if (fresh) {
                // Serve cached value
                this.set(last.value as number);
            } else {
                try {
                    const v = await fetchValue();
                    last.ts = now;
                    last.value = v;
                    if (v === null) {
                        // Indicate unknown; Prometheus won’t treat it as zero.
                        this.set(Number.NaN);
                    } else {
                        this.set(v);
                    }
                } catch {
                    last.ts = now;
                    last.value = null;
                    this.set(Number.NaN);
                }
            }

            // Call any original collect afterwards, allowing additional instrumentation if present
            if (typeof originalCollect === 'function') {
                try {
                    await originalCollect.call(this);
                } catch {
                    // ignore errors from original collect to avoid breaking the scrape
                }
            }
        } as unknown as GaugeConfiguration<T>['collect'];
    }

    const gauge = new PromGauge(gaugeOptions as GaugeConfiguration<T>);

    /**
     * Applies given labels to the gauge. Labels are key-value pairs.
     * This method wraps the original Gauge's labels method for additional type-safety, requiring all configured labels to be specified.
     *
     * @param labels - An object where keys are label names and values are the label values.
     * @returns The Gauge instance with the applied labels, allowing for method chaining.
     */
    const labels = (labels: Record<T, string | number>) => gauge.labels(labels);

    /**
     * Resets the gauge value.
     * Wraps the original Gauge's reset method.
     */
    const reset = () => gauge.reset();

    /**
     * Sets the gauge to a specified value.
     * Wraps the original Gauge's set method.
     *
     * @param value - The value to set the gauge to.
     */
    const set = (value: number) => gauge.set(value);

    return {
        gauge,
        labels,
        reset,
        set,
    };
};
