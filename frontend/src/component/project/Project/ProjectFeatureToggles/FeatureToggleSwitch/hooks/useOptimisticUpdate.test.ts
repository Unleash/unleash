import { renderHook, act } from '@testing-library/react-hooks';
import { useOptimisticUpdate } from './useOptimisticUpdate';

describe('useOptimisticUpdate', () => {
    it('should return state, setter, and rollback function', () => {
        const { result } = renderHook(() => useOptimisticUpdate(true));

        expect(result.current).toEqual([
            true,
            expect.any(Function),
            expect.any(Function),
        ]);
    });

    it('should have working setter', () => {
        const { result } = renderHook(state => useOptimisticUpdate(state), {
            initialProps: 'initial',
        });

        act(() => {
            result.current[1]('updated');
        });

        expect(result.current[0]).toEqual('updated');
    });

    it('should update reset state if input changed', () => {
        const { result, rerender } = renderHook(
            state => useOptimisticUpdate(state),
            {
                initialProps: 'A',
            }
        );

        rerender('B');

        expect(result.current[0]).toEqual('B');
    });

    it('should have working rollback', () => {
        const { result } = renderHook(state => useOptimisticUpdate(state), {
            initialProps: 'initial',
        });

        act(() => {
            result.current[1]('updated');
        });

        act(() => {
            result.current[2]();
        });

        expect(result.current[0]).toEqual('initial');
    });
});
