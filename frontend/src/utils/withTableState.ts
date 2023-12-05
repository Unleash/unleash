import {
    type OnChangeFn,
    type SortingState,
    type PaginationState,
    type TableOptions,
    getCoreRowModel,
} from '@tanstack/react-table';

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
        setTableState: (newState: {
            limit?: number;
            offset?: number;
        }) => void,
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

export const withTableState = <T extends Object>(
    tableState: {
        sortBy: string;
        sortOrder: string;
        limit: number;
        offset: number;
    },
    setTableState: (newState: {
        sortBy?: string;
        sortOrder?: string;
        limit?: number;
        offset?: number;
    }) => void,
    options: Omit<TableOptions<T>, 'getCoreRowModel'>,
) => ({
    getCoreRowModel: getCoreRowModel(),
    enableSorting: true,
    enableMultiSort: false,
    manualPagination: true,
    manualSorting: true,
    enableSortingRemoval: false,
    enableHiding: true,
    state: {
        ...createSortingState(tableState),
        ...createPaginationState(tableState),
        ...(options.state || {}),
    },
    onPaginationChange: createOnPaginationChange(tableState, setTableState),
    onSortingChange: createOnSortingChange(tableState, setTableState),
    ...options,
});

export const _testExports = {
    createOnSortingChange,
    createOnPaginationChange,
    createSortingState,
    createPaginationState,
};
