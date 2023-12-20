import { renderHook } from '@testing-library/react-hooks';
import { useSelectedData } from './useSelectedData';

describe('useSelectedData', () => {
    it('should return an empty array when selection is empty', () => {
        const { result } = renderHook(() =>
            useSelectedData([{ name: 'test1' }, { name: 'test2' }], {}),
        );
        expect(result.current).toEqual([]);
    });

    it('should return selected data when selection is not empty', () => {
        const { result } = renderHook(() =>
            useSelectedData([{ name: 'test1' }, { name: 'test2' }], {
                test1: true,
            }),
        );
        expect(result.current).toEqual([{ name: 'test1' }]);
    });

    it('should return an empty array when data is empty', () => {
        const { result } = renderHook(() =>
            useSelectedData([], { test1: true }),
        );
        expect(result.current).toEqual([]);
    });

    it('should return previous selected data on re-render', () => {
        const { result, rerender } = renderHook(
            ({ data, selection }) => useSelectedData(data, selection),
            {
                initialProps: {
                    data: [{ name: 'test1' }, { name: 'test2' }],
                    selection: { test1: true },
                } as any,
            },
        );
        expect(result.current).toEqual([{ name: 'test1' }]);

        rerender({
            data: [{ name: 'test3' }, { name: 'test4' }],
            selection: { test1: true },
        });
        expect(result.current).toEqual([{ name: 'test1' }]);
    });

    it('should return combined data when data is updated', () => {
        const { result, rerender } = renderHook(
            ({ data, selection }) => useSelectedData(data, selection),
            {
                initialProps: {
                    data: [{ name: 'test1' }, { name: 'test2' }],
                    selection: { test1: true },
                } as any,
            },
        );
        expect(result.current).toEqual([{ name: 'test1' }]);

        rerender({
            data: [{ name: 'test1' }, { name: 'test2' }, { name: 'test3' }],
            selection: { test1: true },
        });
        expect(result.current).toEqual([{ name: 'test1' }, { name: 'test3' }]);
    });

    it('should skip items that are not in data', () => {
        const { result, rerender } = renderHook(
            ({ data, selection }) => useSelectedData(data, selection),
            {
                initialProps: {
                    data: [{ name: 'test1' }, { name: 'test2' }],
                    selection: { test1: true, test3: true },
                } as any,
            },
        );
        expect(result.current).toEqual([{ name: 'test1' }]);
    });
});
