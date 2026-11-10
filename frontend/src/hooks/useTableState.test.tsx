import { vi, expect, describe, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useReactTable } from '@tanstack/react-table';
import { useTableState } from './useTableState.ts';
import { useState } from 'react';
import { render } from '@testing-library/react';

describe('useTableState', () => {
    it('should create paginated and sorted table state', () => {
        const mockTableState = {
            limit: 10,
            offset: 10,
            sortBy: 'name',
            sortOrder: 'asc',
        };
        const mockSetTableState = vi.fn();
        const mockOptions = { data: [], columns: [] };

        const { result } = renderHook(() =>
            useTableState({
                tableState: mockTableState,
                setTableState: mockSetTableState,
                options: mockOptions,
            }),
        );

        expect(result.current.state).toEqual({
            pagination: {
                pageIndex: 1,
                pageSize: 10,
            },
            sorting: [
                {
                    id: 'name',
                    desc: false,
                },
            ],
        });
    });

    it('sets default options', () => {
        const { result } = renderHook(() =>
            useTableState({
                tableState: {
                    limit: 10,
                    offset: 10,
                    sortBy: 'name',
                    sortOrder: 'asc',
                },
                setTableState: vi.fn(),
                options: { data: [], columns: [] },
            }),
        );

        expect(result.current).toMatchObject({
            getCoreRowModel: expect.any(Function),
            enableSorting: true,
            enableMultiSort: false,
            manualPagination: true,
            manualSorting: true,
            enableSortingRemoval: false,
            enableHiding: true,
            onPaginationChange: expect.any(Function),
            onSortingChange: expect.any(Function),
            onColumnVisibilityChange: expect.any(Function),
        });
    });

    it('should update page index and size', () => {
        const mockTableState = {
            limit: 10,
            offset: 10,
            sortBy: 'name',
            sortOrder: 'asc',
        };
        const mockSetTableState = vi.fn();
        const mockOptions = { data: [], columns: [] };

        const { result } = renderHook(() =>
            useReactTable(
                useTableState({
                    tableState: mockTableState,
                    setTableState: mockSetTableState,
                    options: mockOptions,
                }),
            ),
        );

        result.current.setPagination({
            pageIndex: 3,
            pageSize: 5,
        });

        expect(mockSetTableState).toHaveBeenCalledWith({
            limit: 5,
            offset: 15,
        });
    });

    it('should update sorting', () => {
        const mockTableState = {
            limit: 10,
            offset: 10,
            sortBy: 'name',
            sortOrder: 'asc',
        };
        const mockSetTableState = vi.fn();
        const mockOptions = { data: [], columns: [] };

        const { result } = renderHook(() =>
            useReactTable(
                useTableState({
                    tableState: mockTableState,
                    setTableState: mockSetTableState,
                    options: mockOptions,
                }),
            ),
        );

        result.current.setSorting([
            {
                id: 'createdAt',
                desc: true,
            },
        ]);

        expect(mockSetTableState).toHaveBeenCalledWith({
            sortBy: 'createdAt',
            sortOrder: 'desc',
        });
    });

    it('should handle column visibility', () => {
        const mockTableState = {
            limit: 10,
            offset: 10,
            sortBy: 'name',
            sortOrder: 'asc',
            columns: ['name'],
        };
        const mockSetTableState = vi.fn();
        const mockOptions = {
            data: [],
            columns: [
                {
                    id: 'name',
                    show: true,
                },
                {
                    id: 'createdAt',
                    show: false,
                },
            ],
        };

        const { result } = renderHook(() =>
            useReactTable(
                useTableState({
                    tableState: mockTableState,
                    setTableState: mockSetTableState,
                    options: mockOptions,
                }),
            ),
        );

        expect(result.current.getState().columnVisibility).toMatchObject({
            name: true,
        });

        result.current.setColumnVisibility({ name: false, createdAt: true });

        expect(mockSetTableState).toHaveBeenCalledWith({
            columns: ['createdAt'],
        });
    });

    it('is always using external state', () => {
        const initialProps = {
            limit: 5,
            offset: 40,
            sortBy: 'name',
            sortOrder: 'desc',
        };

        const { result, rerender } = renderHook(
            (state) =>
                useReactTable(
                    useTableState({
                        tableState: state as any,
                        setTableState: vi.fn(),
                        options: { data: [], columns: [] },
                    }),
                ),
            { initialProps },
        );

        expect(result.current.getState()).toMatchObject({
            pagination: {
                pageIndex: 8,
                pageSize: 5,
            },
            sorting: [
                {
                    id: 'name',
                    desc: true,
                },
            ],
        });

        rerender({
            limit: 10,
            offset: 10,
            sortBy: 'createdAt',
            sortOrder: 'asc',
        });

        expect(result.current.getState()).toMatchObject({
            pagination: {
                pageIndex: 1,
                pageSize: 10,
            },
            sorting: [
                {
                    id: 'createdAt',
                    desc: false,
                },
            ],
        });
    });

    it('works end-to-end with useReactTable', async () => {
        const Component = () => {
            const [state, setState] = useState({
                limit: 5,
                offset: 40,
                sortBy: 'name',
                sortOrder: 'desc',
            });

            const setTableState = (newState: any) => {
                setState((state) => ({ ...state, ...newState }));
            };

            const table = useReactTable(
                useTableState({
                    tableState: state,
                    setTableState,
                    options: { data: [], columns: [] },
                }),
            );

            return (
                <>
                    <button type='button' onClick={table.nextPage}>
                        Next page
                    </button>
                    <button type='button' onClick={table.previousPage}>
                        Previous page
                    </button>
                    <button
                        type='button'
                        onClick={() =>
                            table.setPagination({ pageIndex: 2, pageSize: 10 })
                        }
                    >
                        Paginate
                    </button>
                    <button
                        type='button'
                        onClick={() =>
                            table.setSorting([{ id: 'createdAt', desc: true }])
                        }
                    >
                        Sort
                    </button>
                    <textarea
                        value={JSON.stringify(table.getState())}
                        readOnly
                    />
                    <input
                        data-testid='page'
                        type='text'
                        value={table.getState().pagination.pageIndex}
                        readOnly
                    />
                    <input
                        data-testid='pageSize'
                        type='text'
                        value={table.getState().pagination.pageSize}
                        readOnly
                    />
                    <input
                        data-testid='sort'
                        type='text'
                        value={table.getState().sorting[0].id}
                        readOnly
                    />
                </>
            );
        };

        const { getByTestId, findByTestId, findByRole } = render(<Component />);

        expect(getByTestId('page')).toHaveValue('8');
        expect(getByTestId('pageSize')).toHaveValue('5');
        expect(getByTestId('sort')).toHaveValue('name');

        (await findByRole('button', { name: 'Next page' })).click();

        expect(await findByTestId('page')).toHaveValue('9');

        (await findByRole('button', { name: 'Previous page' })).click();

        expect(await findByTestId('page')).toHaveValue('8');

        (await findByRole('button', { name: 'Paginate' })).click();

        expect(await findByTestId('page')).toHaveValue('2');
        expect(getByTestId('pageSize')).toHaveValue('10');

        const button = await findByRole('button', { name: 'Sort' });
        button.click();

        const sort = await findByTestId('sort');
        expect(sort).toHaveValue('createdAt');
    });

    it('always shows columns that have `enableHiding: false`', () => {
        const mockTableState = {
            limit: 10,
            offset: 10,
            sortBy: 'name',
            sortOrder: 'asc',
            columns: ['createdAt'],
        };
        const mockSetTableState = vi.fn();
        const mockOptions = {
            data: [],
            columns: [
                {
                    id: 'name',
                    show: false,
                    enableHiding: false,
                },
                {
                    id: 'createdAt',
                    show: true,
                },
            ],
        };

        const { result } = renderHook(() =>
            useTableState({
                tableState: mockTableState,
                setTableState: mockSetTableState,
                options: mockOptions,
            }),
        );

        expect(result.current.state).toMatchObject({
            columnVisibility: {
                name: true,
                createdAt: true,
            },
        });
    });
});
