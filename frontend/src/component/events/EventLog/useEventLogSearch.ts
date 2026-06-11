import {
    encodeSpecParams,
    filterItemQueryParam,
    safeNumberQueryParam,
    stringQueryParam,
    withDefaultQueryParam,
} from 'utils/queryParamSpec';
import { usePersistentTableState } from 'hooks/usePersistentTableState';
import mapValues from 'lodash.mapvalues';
import { useEventSearch } from 'hooks/api/getters/useEventSearch/useEventSearch';
import type { SearchEventsParams } from 'openapi';
import type { FilterItemParamHolder } from 'component/filter/Filters/Filters';
import { format, subYears } from 'date-fns';
import { autocorrectDateRange } from 'component/filter/autocorrectDateRange';
import { DEFAULT_PAGE_LIMIT } from 'utils/paginationConfig';

type Log =
    | { type: 'global' }
    | { type: 'project'; projectId: string }
    | { type: 'flag'; flagName: string };

const extraParameters = (logType: Log) => {
    switch (logType.type) {
        case 'global':
            return {
                project: filterItemQueryParam,
                feature: filterItemQueryParam,
            };
        case 'project':
            return {
                feature: filterItemQueryParam,
                project: withDefaultQueryParam(
                    stringQueryParam,
                    `IS:${logType.projectId}`,
                ),
            };
        case 'flag':
            return {
                project: filterItemQueryParam,
                feature: withDefaultQueryParam(
                    stringQueryParam,
                    `IS:${logType.flagName}`,
                ),
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

export const useEventLogSearch = (
    logType: Log,
    storageKey = 'event-log',
    refreshInterval = 15 * 1000,
) => {
    const stateConfig = {
        offset: withDefaultQueryParam(safeNumberQueryParam, 0),
        limit: withDefaultQueryParam(safeNumberQueryParam, DEFAULT_PAGE_LIMIT),
        query: stringQueryParam,
        from: withDefaultQueryParam(filterItemQueryParam, {
            values: [format(subYears(new Date(), 1), 'yyyy-MM-dd')],
            operator: 'IS',
        }),
        to: withDefaultQueryParam(filterItemQueryParam, {
            values: [format(new Date(), 'yyyy-MM-dd')],
            operator: 'IS',
        }),
        createdBy: filterItemQueryParam,
        type: filterItemQueryParam,
        environment: filterItemQueryParam,
        id: filterItemQueryParam,
        groupId: filterItemQueryParam,
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

    const setTableStateWithDateHandling = (
        newState: Record<string, unknown>,
    ) => {
        setTableState((oldState) => autocorrectDateRange(oldState, newState));
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
        mapValues(encodeSpecParams(stateConfig, tableState), (value) =>
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
