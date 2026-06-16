export type QueryStateLibrary = 'use-query-params' | 'nuqs';

export type QueryStateLibraryConfig = {
    /** Which library drives query-param reads and writes. */
    primary: QueryStateLibrary;
    /**
     * Whether to also run the non-primary library as a read-only shadow
     * and report divergence between the two.
     */
    compare: boolean;
};

const DUMMY_QUERY_STATE_LIBRARY: QueryStateLibraryConfig = {
    primary: 'use-query-params',
    compare: true,
};

/**
 * Selects which query-param library the dual-run facades use.
 *
 * TODO(nuqs-flag): currently returns a hardcoded dummy. Replace with a
 * real flag variant once the backend scaffolding exists, e.g.:
 *
 *   const { uiConfig } = useUiConfig();
 *   const value = useVariant<QueryStateLibraryConfig>(
 *       uiConfig.flags.nuqsQueryState as Variant,
 *   );
 *   return value ?? DUMMY_QUERY_STATE_LIBRARY;
 *
 * with a JSON payload like { "primary": "nuqs", "compare": true }, so the
 * variant can flip the primary and toggle comparison independently, and an
 * impact metric on recordQueryStateDivergence can auto-disable the rollout.
 */
export const useQueryStateLibrary = (): QueryStateLibraryConfig => {
    return DUMMY_QUERY_STATE_LIBRARY;
};
