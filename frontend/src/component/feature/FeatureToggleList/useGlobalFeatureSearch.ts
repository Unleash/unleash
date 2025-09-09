import { useCallback } from 'react';
import { encodeQueryParams, StringParam, withDefault } from 'use-query-params';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import {
    BooleansStringParam,
    FilterItemParam,
} from 'utils/serializeQueryParams';
import { usePersistentTableState } from 'hooks/usePersistentTableState';
import mapValues from 'lodash.mapvalues';
import type { SearchFeaturesParams } from 'openapi';
import { SafeNumberParam } from 'utils/safeNumberParam';
import { DEFAULT_PAGE_LIMIT } from 'utils/paginationConfig';

export const useGlobalFeatureSearch = (pageLimit = DEFAULT_PAGE_LIMIT) => {
    const storageKey = 'features-list-table';
    const stateConfig = {
        offset: withDefault(SafeNumberParam, 0),
        limit: withDefault(SafeNumberParam, pageLimit),
        query: StringParam,
        favoritesFirst: withDefault(BooleansStringParam, true),
        sortBy: withDefault(StringParam, 'createdAt'),
        sortOrder: withDefault(StringParam, 'desc'),
        project: FilterItemParam,
        tag: FilterItemParam,
        state: FilterItemParam,
        segment: FilterItemParam,
        createdAt: FilterItemParam,
        type: FilterItemParam,
        lifecycle: FilterItemParam,
        createdBy: FilterItemParam,
    };
    const [tableState, setTableState] = usePersistentTableState(
        `${storageKey}`,
        stateConfig,
    );

    const {
        offset,
        limit,
        query,
        favoritesFirst,
        sortBy,
        sortOrder,
        ...filterState
    } = tableState;

    const {
        features = [],
        total,
        loading,
        refetch,
        initialLoad,
    } = useFeatureSearch(
        mapValues(encodeQueryParams(stateConfig, tableState), (value) =>
            value ? `${value}` : undefined,
        ) as SearchFeaturesParams,
    );

    return {
        features,
        total,
        refetch,
        loading,
        initialLoad,
        tableState,
        setTableState,
        filterState,
    };
};

// TODO: refactor
// This is similar to `useProjectFeatureSearchActions`, but more generic
// Reuse wasn't possible because the prior one is constrained to the project hook
export const useTableStateFilter = <K extends string>(
    [key, operator]: [K, string],
    state:
        | Record<
              K,
              | {
                    operator: string;
                    values: string[];
                }
              | undefined
              | null
          >
        | undefined
        | null,
    setState: (state: {
        [key: string]: {
            operator: string;
            values: string[];
        };
    }) => void,
) =>
    useCallback(
        (value: string | number) => {
            const currentState = state ? state[key] : undefined;
            console.log({ key, operator, state: currentState, value });

            if (
                currentState &&
                currentState.values.length > 0 &&
                !currentState.values.includes(`${value}`)
            ) {
                setState({
                    ...state,
                    [key]: {
                        operator: currentState.operator,
                        values: [...currentState.values, value],
                    },
                });
            } else if (!currentState) {
                setState({
                    ...state,
                    [key]: {
                        operator: operator,
                        values: [value],
                    },
                });
            }
        },
        [state, setState, key, operator],
    );
