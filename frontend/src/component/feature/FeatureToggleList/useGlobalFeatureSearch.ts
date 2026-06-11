import { useCallback } from 'react';
import { parseAsInteger, parseAsString } from 'nuqs';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import {
    encodeParams,
    filterItemParam,
    strictBooleanParam,
} from 'utils/nuqsParams';
import { usePersistentTableState } from 'hooks/usePersistentTableState.nuqs';
import mapValues from 'lodash.mapvalues';
import type { SearchFeaturesParams } from 'openapi';
import { DEFAULT_PAGE_LIMIT } from 'utils/paginationConfig';

export const useGlobalFeatureSearch = (pageLimit = DEFAULT_PAGE_LIMIT) => {
    const storageKey = 'features-list-table';
    const stateConfig = {
        offset: parseAsInteger.withDefault(0),
        limit: parseAsInteger.withDefault(pageLimit),
        query: parseAsString,
        favoritesFirst: strictBooleanParam.withDefault(true),
        sortBy: parseAsString.withDefault('createdAt'),
        sortOrder: parseAsString.withDefault('desc'),
        project: filterItemParam,
        tag: filterItemParam,
        state: filterItemParam,
        segment: filterItemParam,
        createdAt: filterItemParam,
        type: filterItemParam,
        lifecycle: filterItemParam,
        createdBy: filterItemParam,
        favorite: filterItemParam,
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

    const apiTableState = tableState;

    const {
        features = [],
        total,
        loading,
        refetch,
        initialLoad,
    } = useFeatureSearch(
        mapValues(encodeParams(stateConfig, apiTableState), (value) =>
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
