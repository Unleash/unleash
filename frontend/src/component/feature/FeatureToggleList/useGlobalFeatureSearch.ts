import {
    encodeQueryParams,
    NumberParam,
    StringParam,
    withDefault,
} from 'use-query-params';
import {
    DEFAULT_PAGE_LIMIT,
    useFeatureSearch,
} from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import {
    BooleansStringParam,
    FilterItemParam,
} from 'utils/serializeQueryParams';
import { usePersistentTableState } from 'hooks/usePersistentTableState';
import mapValues from 'lodash.mapvalues';
import type { SearchFeaturesParams } from 'openapi';

export const useGlobalFeatureSearch = (pageLimit = DEFAULT_PAGE_LIMIT) => {
    const storageKey = 'features-list-table';
    const stateConfig = {
        offset: withDefault(NumberParam, 0),
        limit: withDefault(NumberParam, pageLimit),
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
