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
import type { SearchEventsParams } from 'openapi';
import type { FilterItemParamHolder } from 'component/filter/Filters/Filters';

type Log =
    | { type: 'global' }
    | { type: 'project'; projectId: string }
    | { type: 'flag'; flagName: string };

const extraParameters = (logType: Log) => {
    switch (logType.type) {
        case 'global':
            return { project: FilterItemParam, feature: FilterItemParam };
        case 'project':
            return {
                feature: FilterItemParam,
                project: withDefault(StringParam, `IS:${logType.projectId}`),
            };
        case 'flag':
            return {
                project: FilterItemParam,
                feature: withDefault(StringParam, `IS:${logType.flagName}`),
            };
    }
};

export const useEventLogSearch = (
    logType: Log,
    storageKey = 'event-log',
    refreshInterval = 15 * 1000,
) => {
    const stateConfig = {
        offset: withDefault(NumberParam, 0),
        limit: withDefault(NumberParam, DEFAULT_PAGE_LIMIT),
        query: StringParam,
        from: FilterItemParam,
        to: FilterItemParam,
        createdBy: FilterItemParam,
        type: FilterItemParam,
        ...extraParameters(logType),
    };

    const fullStorageKey = (() => {
        switch (logType.type) {
            case 'global':
                return `${storageKey}-global`;
            case 'project':
                return `${storageKey}-project:${logType.projectId}`;
            case 'flag':
                return `${storageKey}-flag:${logType.flagName}`;
        }
    })();

    const [tableState, setTableState] = usePersistentTableState(
        fullStorageKey,
        stateConfig,
    );

    const filterState = (() => {
        const { offset, limit, query, ...fs } = tableState;
        switch (logType.type) {
            case 'global':
                return fs as FilterItemParamHolder;
            case 'project':
                return { ...fs, project: undefined } as FilterItemParamHolder;
            case 'flag':
                return {
                    ...fs,
                    feature: undefined,
                    project: undefined,
                } as FilterItemParamHolder;
        }
    })();

    const { events, total, refetch, loading, initialLoad } = useEventSearch(
        mapValues(encodeQueryParams(stateConfig, tableState), (value) =>
            value ? `${value}` : undefined,
        ) as SearchEventsParams,
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
