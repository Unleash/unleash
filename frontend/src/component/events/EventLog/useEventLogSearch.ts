import {
    encodeQueryParams,
    NumberParam,
    StringParam,
    withDefault,
} from 'use-query-params';
import { DEFAULT_PAGE_LIMIT } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import { FilterItemParam } from 'utils/serializeQueryParams';
import { usePersistentTableState } from 'hooks/usePersistentTableState';
import mapValues from 'lodash.mapvalues';
import { useEventSearch } from 'hooks/api/getters/useEventSearch/useEventSearch';

type Log =
    | { type: 'global' }
    | { type: 'project'; projectId: string }
    | { type: 'flag'; flagName: string };

const getTypeSpecificData = (logType: Log, storageKey: string) => {
    return () => {
        const sharedFilters = {
            from: FilterItemParam,
            to: FilterItemParam,
            createdBy: FilterItemParam,
            type: FilterItemParam,
        };

        const sharedOtherState = {
            offset: withDefault(NumberParam, 0),
            limit: withDefault(NumberParam, DEFAULT_PAGE_LIMIT),
            query: StringParam,
        };

        switch (logType.type) {
            case 'global':
                return {
                    fullStorageKey: `${storageKey}-global`,
                    filterState: {
                        ...sharedFilters,
                        project: FilterItemParam,
                        feature: FilterItemParam,
                    },
                    otherState: sharedOtherState,
                };

            case 'project':
                return {
                    fullStorageKey: `${storageKey}-project:${logType.projectId}`,
                    filterState: { ...sharedFilters, feature: FilterItemParam },
                    otherState: {
                        ...sharedOtherState,
                        project: withDefault(
                            StringParam,
                            `IS:${logType.projectId}`,
                        ),
                    },
                };
            case 'flag':
                return {
                    fullStorageKey: `${storageKey}-flag:${logType.flagName}`,
                    filterState: { ...sharedFilters, feature: FilterItemParam },
                    otherState: {
                        ...sharedOtherState,
                        feature: withDefault(
                            StringParam,
                            `IS:${logType.flagName}`,
                        ),
                    },
                };
        }
    };
};
export const useEventLogSearch = (
    logType: Log,
    storageKey = 'event-log',
    refreshInterval = 15 * 1000,
) => {
    const { fullStorageKey, filterState, otherState } = getTypeSpecificData(
        logType,
        storageKey,
    )();

    const stateConfig = {
        ...filterState,
        ...otherState,
    };

    const [tableState, setTableState] = usePersistentTableState(
        fullStorageKey,
        stateConfig,
    );

    const { events, total, refetch, loading, initialLoad } = useEventSearch(
        mapValues(encodeQueryParams(stateConfig, tableState), (value) =>
            value ? `${value}` : undefined,
        ),
        {
            refreshInterval,
        },
    );

    return {
        events,
        total,
        refetch,
        loading,
        initialLoad,
        tableState,
        setTableState,
        filterState,
    };
};
