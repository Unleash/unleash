import {
    ArrayParam,
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

export const useProjectFeatureSearch = (
    projectId: string,
    storageKey = 'project-overview-v2',
    refreshInterval = 15 * 1000,
) => {
    const stateConfig = {
        offset: withDefault(NumberParam, 0),
        limit: withDefault(NumberParam, DEFAULT_PAGE_LIMIT),
        query: StringParam,
        favoritesFirst: withDefault(BooleansStringParam, true),
        sortBy: withDefault(StringParam, 'createdAt'),
        sortOrder: withDefault(StringParam, 'desc'),
        columns: ArrayParam,
        tag: FilterItemParam,
        createdAt: FilterItemParam,
    };
    const [tableState, setTableState] = usePersistentTableState(
        `${storageKey}-${projectId}`,
        stateConfig,
    );

    const { columns: _, ...apiTableState } = tableState;
    const { features, total, refetch, loading, initialLoad } = useFeatureSearch(
        mapValues(
            {
                ...encodeQueryParams(stateConfig, apiTableState),
                project: `IS:${projectId}`,
            },
            (value) => (value ? `${value}` : undefined),
        ),
        {
            refreshInterval,
        },
    );

    return {
        features,
        total,
        refetch,
        loading,
        initialLoad,
        tableState,
        setTableState,
    };
};
