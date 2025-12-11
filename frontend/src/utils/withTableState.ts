import {
    type OnChangeFn,
    type SortingState,
    type PaginationState,
    type TableOptions,
    type VisibilityState,
    getCoreRowModel,
} from '@tanstack/react-table';

type TableStateColumns = (string | null)[] | null | undefined;

const createOnSortingChange =
    (
        tableState: {
            sortBy: string;
            sortOrder: string;
        },
        setTableState: (newState: {
            sortBy?: string;
            sortOrder?: string;
        }) => void,
    ): OnChangeFn<SortingState> =>
    (newSortBy) => {
        if (typeof newSortBy === 'function') {
            const computedSortBy = newSortBy([
                {
                    id: tableState.sortBy,
                    desc: tableState.sortOrder === 'desc',
                },
            ])[0];
            setTableState({
                sortBy: computedSortBy?.id,
                sortOrder: computedSortBy?.desc ? 'desc' : 'asc',
            });
        } else {
            const sortBy = newSortBy[0];
            setTableState({
                sortBy: sortBy?.id,
                sortOrder: sortBy?.desc ? 'desc' : 'asc',
            });
        }
    };

const createOnPaginationChange =
    (
        tableState: {
            limit: number;
            offset: number;
        },
        setTableState: (newState: { limit?: number; offset?: number }) => void,
    ): OnChangeFn<PaginationState> =>
    (newPagination) => {
        if (typeof newPagination === 'function') {
            const computedPagination = newPagination({
                pageSize: tableState.limit,
                pageIndex: tableState.offset
                    ? Math.floor(tableState.offset / tableState.limit)
                    : 0,
            });
            setTableState({
                limit: computedPagination?.pageSize,
                offset: computedPagination?.pageIndex
                    ? computedPagination?.pageIndex *
                      computedPagination?.pageSize
                    : 0,
            });
        } else {
            const { pageSize, pageIndex } = newPagination;
            setTableState({
                limit: pageSize,
                offset: pageIndex ? pageIndex * pageSize : 0,
            });
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

export const withTableState = <T extends Object>(
    tableState: {
        sortBy: string;
        sortOrder: string;
        limit: number;
        offset: number;
        columns?: TableStateColumns;
    },
    setTableState: (newState: {
        sortBy?: string;
        sortOrder?: string;
        limit?: number;
        offset?: number;
        columns?: TableStateColumns;
    }) => void,
    options: Omit<TableOptions<T>, 'getCoreRowModel'>,
) => {
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
        onPaginationChange: createOnPaginationChange(tableState, setTableState),
        onSortingChange: createOnSortingChange(tableState, setTableState),
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
