import { vi } from 'vitest';
import { withTableState, _testExports } from './withTableState';

const {
    createOnSortingChange,
    createOnPaginationChange,
    createSortingState,
    createPaginationState,
} = _testExports;

describe('createOnSortingChange', () => {
    const setTableState = vi.fn();
    const tableState = {
        sortBy: 'name',
        sortOrder: 'asc',
    };

    it('should call setTableState with the correct arguments', () => {
        const newSortBy = 'age';
        const onChange = createOnSortingChange(tableState, setTableState);
        onChange(() => [{ id: newSortBy, desc: false }]);
        expect(setTableState).toHaveBeenCalledWith({
            sortBy: newSortBy,
            sortOrder: 'asc',
        });
    });
});

describe('createOnPaginationChange', () => {
    const setTableState = vi.fn();
    const tableState = {
        limit: 10,
        offset: 0,
    };

    it('should call setTableState with the correct arguments', () => {
        const onChange = createOnPaginationChange(tableState, setTableState);
        onChange({
            pageSize: 20,
            pageIndex: 1,
        });
        expect(setTableState).toHaveBeenLastCalledWith({
            limit: 20,
            offset: 20,
        });
        onChange(() => ({
            pageSize: 5,
            pageIndex: 0,
        }));
        expect(setTableState).toHaveBeenLastCalledWith({
            limit: 5,
            offset: 0,
        });
    });
});

describe('createSortingState', () => {
    const tableState = {
        sortBy: 'name',
        sortOrder: 'asc',
    };

    it('should return the correct sorting state', () => {
        const sortingState = createSortingState(tableState);
        expect(sortingState).toEqual({
            sorting: [
                {
                    id: tableState.sortBy,
                    desc: tableState.sortOrder === 'desc',
                },
            ],
        });
    });
});

describe('createPaginationState', () => {
    const tableState = {
        limit: 10,
        offset: 0,
    };

    it('should return the correct pagination state', () => {
        const paginationState = createPaginationState(tableState);
        expect(paginationState).toEqual({
            pagination: {
                pageIndex: tableState.offset
                    ? tableState.offset / tableState.limit
                    : 0,
                pageSize: tableState.limit,
            },
        });
    });
});

describe('withTableState', () => {
    const tableState = {
        sortBy: 'name',
        sortOrder: 'asc',
        limit: 10,
        offset: 0,
    };
    const setTableState = vi.fn();
    const options = withTableState(tableState, setTableState, {
        columns: [],
        data: [],
    });

    it('should return the correct initial state', () => {
        expect(options).toMatchInlineSnapshot(`
          {
            "columns": [],
            "data": [],
            "enableHiding": true,
            "enableMultiSort": false,
            "enableSorting": true,
            "enableSortingRemoval": false,
            "getCoreRowModel": [Function],
            "manualPagination": true,
            "manualSorting": true,
            "onPaginationChange": [Function],
            "onSortingChange": [Function],
            "state": {
              "pagination": {
                "pageIndex": 0,
                "pageSize": 10,
              },
              "sorting": [
                {
                  "desc": false,
                  "id": "name",
                },
              ],
            },
          }
        `);
    });

    it('should update pagination state on events', () => {
        options.onPaginationChange({
            pageSize: 5,
            pageIndex: 2,
        });

        expect(setTableState).toHaveBeenLastCalledWith({
            limit: 5,
            offset: 10,
        });
    });

    it('should update sorting state on events', () => {
        options.onSortingChange(() => [{ id: 'age', desc: false }]);

        expect(setTableState).toHaveBeenLastCalledWith({
            sortBy: 'age',
            sortOrder: 'asc',
        });

        options.onSortingChange([{ id: 'createdAt', desc: true }]);

        expect(setTableState).toHaveBeenLastCalledWith({
            sortBy: 'createdAt',
            sortOrder: 'desc',
        });
    });
});
