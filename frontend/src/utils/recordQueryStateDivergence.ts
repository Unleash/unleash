export type QueryStateDivergence = {
    /** Identifies the consumer, e.g. the persistent-table storage key. */
    source: string;
    /** Whether decoded state or encoded output diverged. */
    kind: 'decode' | 'encode';
    /** The param keys that diverged. Never the values: they can contain user input. */
    keys: string[];
};

/**
 * Reporting seam for use-query-params/nuqs divergence found by the
 * dual-run facades.
 *
 * TODO(nuqs-metrics): wire this to an impact metric so that divergence in
 * production automatically disables the nuqs rollout flag. Until then it
 * only logs to the console.
 */
export const recordQueryStateDivergence = (
    divergence: QueryStateDivergence,
): void => {
    console.warn(
        '[query-state-migration] use-query-params and nuqs diverged',
        divergence,
    );
};
