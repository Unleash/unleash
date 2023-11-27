import { vi, type Mock } from 'vitest';
import { renderHook } from '@testing-library/react-hooks';
import { useTableState } from './useTableState';
import { createLocalStorage } from 'utils/createLocalStorage';
import { useSearchParams } from 'react-router-dom';
import { act } from 'react-test-renderer';

vi.mock('react-router-dom', () => ({
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
}));
vi.mock('../utils/createLocalStorage', () => ({
    createLocalStorage: vi.fn(() => ({
        value: {},
        setValue: vi.fn(),
    })),
}));

const mockStorage = createLocalStorage as Mock;
const mockQuery = useSearchParams as Mock;

describe('useTableState', () => {
    beforeEach(() => {
        mockStorage.mockRestore();
        mockQuery.mockRestore();
    });

    it('should return default params', () => {
        const { result } = renderHook(() =>
            useTableState<{
                page: '0';
                pageSize: '10';
            }>({ page: '0', pageSize: '10' }, 'test', [], []),
        );
        expect(result.current[0]).toEqual({ page: '0', pageSize: '10' });
    });

    it('should return params from local storage', () => {
        mockStorage.mockReturnValue({
            value: { pageSize: 25 },
            setValue: vi.fn(),
        });

        const { result } = renderHook(() =>
            useTableState({ pageSize: '10' }, 'test', [], []),
        );

        expect(result.current[0]).toEqual({ pageSize: 25 });
    });

    it('should return params from url', () => {
        mockQuery.mockReturnValue([new URLSearchParams('page=1'), vi.fn()]);

        const { result } = renderHook(() =>
            useTableState({ page: '0' }, 'test', [], []),
        );

        expect(result.current[0]).toEqual({ page: '1' });
    });

    it('should use params from url over local storage', () => {
        mockQuery.mockReturnValue([
            new URLSearchParams('page=2&pageSize=25'),
            vi.fn(),
        ]);
        mockStorage.mockReturnValue({
            value: { pageSize: '10', sortOrder: 'desc' },
            setValue: vi.fn(),
        });

        const { result } = renderHook(() =>
            useTableState({ page: '1', pageSize: '5' }, 'test', [], []),
        );

        expect(result.current[0]).toEqual({
            page: '2',
            pageSize: '25',
        });
    });

    it('sets local state', () => {
        const { result } = renderHook(() =>
            useTableState({ page: '1' }, 'test', [], []),
        );
        const setParams = result.current[1];

        act(() => {
            setParams({ page: '2' });
        });

        expect(result.current[0]).toEqual({ page: '2' });
    });

    it('keeps previous state', () => {
        const { result } = renderHook(() =>
            useTableState({ page: '1', pageSize: '10' }, 'test', [], []),
        );
        const setParams = result.current[1];

        act(() => {
            setParams({ page: '2' });
        });

        expect(result.current[0]).toEqual({ page: '2', pageSize: '10' });
    });

    it('removes params from previous state', () => {
        const { result } = renderHook(() =>
            useTableState({ page: '1', pageSize: '10' }, 'test', [], []),
        );
        const setParams = result.current[1];

        act(() => {
            setParams({ pageSize: undefined });
        });

        expect(result.current[0]).toEqual({ page: '1' });

        // ensure that there are no keys with undefined values
        expect(Object.keys(result.current[0])).toHaveLength(1);
    });

    it('removes params from url', () => {
        const querySetter = vi.fn();
        mockQuery.mockReturnValue([new URLSearchParams('page=2'), querySetter]);

        const { result } = renderHook(() =>
            useTableState(
                { page: '1', pageSize: '10' },
                'test',
                ['page', 'pageSize'],
                [],
            ),
        );
        const setParams = result.current[1];

        expect(result.current[0]).toEqual({ page: '2', pageSize: '10' });

        act(() => {
            setParams({ page: '10', pageSize: undefined });
        });

        expect(result.current[0]).toEqual({ page: '10' });

        expect(querySetter).toHaveBeenCalledWith({
            page: '10',
        });
    });

    it('removes params from local storage', () => {
        const storageSetter = vi.fn();
        mockStorage.mockReturnValue({
            value: { sortBy: 'type' },
            setValue: storageSetter,
        });

        const { result } = renderHook(() =>
            useTableState(
                { sortBy: 'createdAt', pageSize: '10' },
                'test',
                [],
                ['sortBy', 'pageSize'],
            ),
        );

        expect(result.current[0]).toEqual({ sortBy: 'type', pageSize: '10' });

        act(() => {
            result.current[1]({ pageSize: undefined });
        });

        expect(result.current[0]).toEqual({ sortBy: 'type' });

        expect(storageSetter).toHaveBeenCalledWith({
            sortBy: 'type',
        });
    });

    test('saves default parameters if not explicitly provided', (key) => {
        const querySetter = vi.fn();
        const storageSetter = vi.fn();
        mockQuery.mockReturnValue([new URLSearchParams(), querySetter]);
        mockStorage.mockReturnValue({
            value: {},
            setValue: storageSetter,
        });

        const { result } = renderHook(() => useTableState({}, 'test'));

        act(() => {
            result.current[1]({
                unspecified: 'test',
                page: '2',
                pageSize: '10',
                search: 'test',
                sortBy: 'type',
                sortOrder: 'favorites',
                favorites: 'false',
                columns: ['test', 'id'],
            });
        });

        expect(storageSetter).toHaveBeenCalledTimes(1);
        expect(storageSetter).toHaveBeenCalledWith({
            pageSize: '10',
            search: 'test',
            sortBy: 'type',
            sortOrder: 'favorites',
            favorites: 'false',
            columns: ['test', 'id'],
        });
        expect(querySetter).toHaveBeenCalledTimes(1);
        expect(querySetter).toHaveBeenCalledWith({
            page: '2',
            pageSize: '10',
            search: 'test',
            sortBy: 'type',
            sortOrder: 'favorites',
            favorites: 'false',
            columns: ['test', 'id'],
        });
    });

    it("doesn't save default params if explicitly specified", () => {
        const storageSetter = vi.fn();
        mockStorage.mockReturnValue({
            value: {},
            setValue: storageSetter,
        });
        const querySetter = vi.fn();
        mockQuery.mockReturnValue([new URLSearchParams(), querySetter]);

        const { result } = renderHook(() =>
            useTableState<{
                [key: string]: string;
            }>({}, 'test', ['saveOnlyThisToUrl'], ['page']),
        );
        const setParams = result.current[1];

        act(() => {
            setParams({
                saveOnlyThisToUrl: 'test',
                page: '2',
                pageSize: '10',
                search: 'test',
                sortBy: 'type',
                sortOrder: 'favorites',
                favorites: 'false',
                columns: 'test,id',
            });
        });

        expect(querySetter).toHaveBeenCalledWith({ saveOnlyThisToUrl: 'test' });
        expect(storageSetter).toHaveBeenCalledWith({ page: '2' });
    });

    it('can update query and storage without triggering a rerender', () => {
        const { result } = renderHook(() =>
            useTableState({ page: '1' }, 'test', [], []),
        );
        const setParams = result.current[1];

        act(() => {
            setParams({ page: '2' }, true);
        });

        expect(result.current[0]).toEqual({ page: '1' });
    });
});
