import {
    encodeQueryParams,
    NumberParam,
    StringParam,
    withDefault,
} from 'use-query-params';
import { FilterItemParam } from 'utils/serializeQueryParams';
import { usePersistentTableState } from 'hooks/usePersistentTableState';
import mapValues from 'lodash.mapvalues';
import { useEventSearch } from 'hooks/api/getters/useEventSearch/useEventSearch';
import type { SearchEventsParams } from 'openapi';
import type { FilterItemParamHolder } from 'component/filter/Filters/Filters';
import { useState } from 'react';

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

export const DEFAULT_PAGE_SIZE = 25;

type Pagination = {
    currentPage: number;
    nextPage: () => void;
    prevPage: () => void;
};

export const useEventLogSearch = (
    logType: Log,
    storageKey = 'event-log',
    refreshInterval = 15 * 1000,
    pageSize = DEFAULT_PAGE_SIZE,
    initialPage = 0,
) => {
    const [currentPage, setCurrentPage] = useState(Math.max(initialPage, 0));

    console.log('current page', currentPage, pageSize * (currentPage - 1));

    const stateConfig = {
        offset: NumberParam,
        limit: NumberParam,
        query: StringParam,
        from: FilterItemParam,
        to: FilterItemParam,
        createdBy: FilterItemParam,
        type: FilterItemParam,
        ...extraParameters(logType),
    };

    console.log('stateConfig', stateConfig.offset);

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

    console.log(
        tableState,
        stateConfig,
        mapValues(encodeQueryParams(stateConfig, tableState), (value) =>
            value ? `${value}` : undefined,
        ),
    );
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
        limit: tableState.limit,
        pagination: {
            currentPage,
            nextPage: () => {
                setCurrentPage((prev) => prev + 1);
                setTableState({
                    offset: pageSize * currentPage,
                });
            },

            prevPage: () => {
                setCurrentPage((prev) => prev - 1);
                setTableState({
                    offset: pageSize * Math.max(currentPage - 1, 0),
                });
            },
        },
    };
};
