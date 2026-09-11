import {
    type OnChangeFn,
    type SortingState,
    type PaginationState,
    type TableOptions,
    type VisibilityState,
    getCoreRowModel,
} from '@tanstack/react-table';
import { type Tracker, useTracking } from 'hooks/useTracking';
import type { Tracking } from 'utils/trackingEvents';
import { trackedColumnName } from 'utils/formatEnvironmentColumnId';

type TableStateColumns = (string | null)[] | null | undefined;

const createOnSortingChange =
    ({
        tableState,
        setTableState,
        trackSorted,
    }: {
        tableState: {
            sortBy: string;
            sortOrder: string;
        };
        setTableState: (newState: {
            sortBy?: string;
            sortOrder?: string;
        }) => void;
        trackSorted: Tracker;
    }): OnChangeFn<SortingState> =>
    (newSortBy) => {
        const sortBy =
            typeof newSortBy === 'function'
                ? newSortBy([
                      {
                          id: tableState.sortBy,
                          desc: tableState.sortOrder === 'desc',
                      },
                  ])[0]
                : newSortBy[0];

        setTableState({
            sortBy: sortBy?.id,
            sortOrder: sortBy?.desc ? 'desc' : 'asc',
        });
        if (sortBy?.id) {
            trackSorted('succeeded', {
                column: trackedColumnName(sortBy.id),
                direction: sortBy.desc ? 'desc' : 'asc',
            });
        }
    };

const createOnPaginationChange =
    ({
        tableState,
        setTableState,
        trackPaginated,
        trackPageSizeChanged,
    }: {
        tableState: {
            limit: number;
            offset: number;
        };
        setTableState: (newState: { limit?: number; offset?: number }) => void;
        trackPaginated: Tracker;
        trackPageSizeChanged: Tracker;
    }): OnChangeFn<PaginationState> =>
    (newPagination) => {
        const currentPageIndex = tableState.offset
            ? Math.floor(tableState.offset / tableState.limit)
            : 0;
        const { pageSize, pageIndex } =
            typeof newPagination === 'function'
                ? newPagination({
                      pageSize: tableState.limit,
                      pageIndex: currentPageIndex,
                  })
                : newPagination;

        setTableState({
            limit: pageSize,
            offset: pageIndex ? pageIndex * pageSize : 0,
        });
        if (pageSize !== tableState.limit) {
            trackPageSizeChanged('succeeded', { pageSize });
        } else if (pageIndex !== currentPageIndex) {
            trackPaginated('succeeded', { pageDepth: pageIndex + 1 });
        }
    };

const createOnColumnVisibilityChange =
    (
        tableState: {
            columns?: TableStateColumns;
        },
        setTableState: (newState: { columns?: TableStateColumns }) => void,
    ): OnChangeFn<VisibilityState> =>
    (newVisibility) => {
        const columnsObject = tableState.columns?.reduce(
            (acc, column) => ({
                ...acc,
                ...(column && { [column]: true }),
            }),
            {},
        );

        if (typeof newVisibility === 'function') {
            const computedVisibility = newVisibility(columnsObject || {});
            const columns = Object.keys(computedVisibility).filter(
                (column) => computedVisibility[column],
            );

            setTableState({ columns });
        } else {
            const columns = Object.keys(newVisibility).filter(
                (column) => newVisibility[column],
            );
            setTableState({ columns });
        }
    };

const createSortingState = (tableState: {
    sortBy: string;
    sortOrder: string;
}) => ({
    sorting: [
        {
            id: tableState.sortBy,
            desc: tableState.sortOrder === 'desc',
        },
    ],
});

const createPaginationState = (tableState: {
    limit: number;
    offset: number;
}) => ({
    pagination: {
        pageIndex: tableState.offset ? tableState.offset / tableState.limit : 0,
        pageSize: tableState.limit,
    },
});

const createColumnVisibilityState = (tableState: {
    columns?: TableStateColumns;
}) =>
    tableState.columns
        ? {
              columnVisibility: tableState.columns?.reduce(
                  (acc, column) => ({
                      ...acc,
                      ...(column && { [column]: true }),
                  }),
                  {},
              ),
          }
        : {};

type UseTableStateArgs<T extends Object> = {
    tableState: {
        sortBy: string;
        sortOrder: string;
        limit: number;
        offset: number;
        columns?: TableStateColumns;
    };
    setTableState: (newState: {
        sortBy?: string;
        sortOrder?: string;
        limit?: number;
        offset?: number;
        columns?: TableStateColumns;
    }) => void;
    options: Omit<TableOptions<T>, 'getCoreRowModel'>;
    // With a descriptor the table emits sorted, paginated and page-size-changed rows itself.
    tracking?: Tracking;
};

export const useTableState = <T extends Object>({
    tableState,
    setTableState,
    options,
    tracking,
}: UseTableStateArgs<T>) => {
    const trackSorted = useTracking(
        tracking && { ...tracking, type: 'sorted' },
    );
    const trackPaginated = useTracking(
        tracking && { ...tracking, type: 'paginated' },
    );
    const trackPageSizeChanged = useTracking(
        tracking && { ...tracking, type: 'page-size-changed' },
    );

    const hideAllColumns = Object.fromEntries(
        Object.keys(options.state?.columnVisibility || {}).map((column) => [
            column,
            false,
        ]),
    );
    const showAlwaysVisibleColumns = Object.fromEntries(
        options.columns
            .filter(({ enableHiding }) => enableHiding === false)
            .map((column) => [column.id, true]),
    );
    const columnVisibility = tableState.columns
        ? {
              ...hideAllColumns,
              ...createColumnVisibilityState(tableState).columnVisibility,
              ...showAlwaysVisibleColumns,
          }
        : options.state?.columnVisibility;

    return {
        getCoreRowModel: getCoreRowModel(),
        enableSorting: true,
        enableMultiSort: false,
        manualPagination: true,
        manualSorting: true,
        enableSortingRemoval: false,
        enableHiding: true,
        onPaginationChange: createOnPaginationChange({
            tableState,
            setTableState,
            trackPaginated,
            trackPageSizeChanged,
        }),
        onSortingChange: createOnSortingChange({
            tableState,
            setTableState,
            trackSorted,
        }),
        onColumnVisibilityChange: createOnColumnVisibilityChange(
            tableState,
            setTableState,
        ),
        ...options,
        state: {
            ...createSortingState(tableState),
            ...createPaginationState(tableState),
            ...(options.state || {}),
            columnVisibility,
        },
    };
};
