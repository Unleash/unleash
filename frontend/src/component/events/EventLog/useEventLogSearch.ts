import { encodeQueryParams, StringParam, withDefault } from 'use-query-params';
import { FilterItemParam } from 'utils/serializeQueryParams';
import { usePersistentTableState } from 'hooks/usePersistentTableState';
import mapValues from 'lodash.mapvalues';
import { useEventSearch } from 'hooks/api/getters/useEventSearch/useEventSearch';
import type { SearchEventsParams } from 'openapi';
import type { FilterItemParamHolder } from 'component/filter/Filters/Filters';
import { format, isAfter, isBefore, subYears } from 'date-fns';
import { SafeNumberParam } from 'utils/safeNumberParam';
import { DEFAULT_PAGE_LIMIT } from 'utils/paginationConfig';

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

export const calculatePaginationInfo = ({
    offset,
    pageSize,
}: {
    offset: number;
    pageSize: number;
}) => {
    const currentPage = Math.floor(offset / Math.max(pageSize, 1));

    return {
        currentPage,
        nextPageOffset: pageSize * (currentPage + 1),
        previousPageOffset: pageSize * Math.max(currentPage - 1, 0),
    };
};

type DateFilterValue = { values: string[] };

const isDateFilter = (value: unknown): value is DateFilterValue =>
    typeof value === 'object' &&
    value !== null &&
    'values' in value &&
    Array.isArray((value as DateFilterValue).values);

export const handleDateAdjustment = <T extends Record<string, unknown>>(
    oldState: Record<string, unknown>,
    stateUpdate: T,
    prefix = '',
): T => {
    const fromKey = `${prefix}from`;
    const toKey = `${prefix}to`;
    const from = stateUpdate[fromKey];
    const to = stateUpdate[toKey];
    if (isDateFilter(from) && !to) {
        const oldTo = oldState[toKey];
        if (
            isDateFilter(oldTo) &&
            isAfter(new Date(from.values[0]), new Date(oldTo.values[0]))
        ) {
            return {
                ...stateUpdate,
                [toKey]: from,
            };
        }
    } else if (isDateFilter(to) && !from) {
        const oldFrom = oldState[fromKey];
        if (
            isDateFilter(oldFrom) &&
            isBefore(new Date(to.values[0]), new Date(oldFrom.values[0]))
        ) {
            return {
                ...stateUpdate,
                [fromKey]: to,
            };
        }
    }

    return stateUpdate;
};

export const useEventLogSearch = (
    logType: Log,
    storageKey = 'event-log',
    refreshInterval = 15 * 1000,
) => {
    const stateConfig = {
        offset: withDefault(SafeNumberParam, 0),
        limit: withDefault(SafeNumberParam, DEFAULT_PAGE_LIMIT),
        query: StringParam,
        from: withDefault(FilterItemParam, {
            values: [format(subYears(new Date(), 1), 'yyyy-MM-dd')],
            operator: 'IS',
        }),
        to: withDefault(FilterItemParam, {
            values: [format(new Date(), 'yyyy-MM-dd')],
            operator: 'IS',
        }),
        createdBy: FilterItemParam,
        type: FilterItemParam,
        environment: FilterItemParam,
        id: FilterItemParam,
        groupId: FilterItemParam,
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
        ['from', 'to', 'offset'],
    );

    const setTableStateWithDateHandling = (newState: typeof tableState) => {
        setTableState((oldState) => handleDateAdjustment(oldState, newState));
    };

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

    const { currentPage, nextPageOffset, previousPageOffset } =
        calculatePaginationInfo({
            offset: tableState.offset ?? 0,
            pageSize: tableState.limit ?? 1,
        });

    return {
        events,
        total,
        refetch,
        loading,
        initialLoad,
        tableState,
        setTableState: setTableStateWithDateHandling,
        filterState,
        pagination: {
            pageSize: tableState.limit ?? 0,
            currentPage,
            nextPage: () => {
                setTableState({ offset: nextPageOffset });
            },
            prevPage: () => {
                setTableState({ offset: previousPageOffset });
            },
            setPageLimit: (limit: number) => {
                setTableState({ limit, offset: 0 });
            },
        },
    };
};
