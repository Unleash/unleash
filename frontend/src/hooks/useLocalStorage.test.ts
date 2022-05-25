import { vi } from 'vitest';
import { useLocalStorage } from './useLocalStorage';
import { act, renderHook } from '@testing-library/react-hooks';

describe('useLocalStorage', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return an object with data and mutate properties', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() =>
            JSON.stringify(undefined)
        );
        const { result } = renderHook(() => useLocalStorage('key', {}));

        expect(result.current).toEqual([{}, expect.any(Function)]);
    });

    it('returns default value', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() =>
            JSON.stringify(undefined)
        );
        const { result } = renderHook(() =>
            useLocalStorage('key', { key: 'value' })
        );

        expect(result.current).toEqual([
            { key: 'value' },
            expect.any(Function),
        ]);
    });

    it('returns a value from local storage', async () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() =>
            JSON.stringify({ key: 'value' })
        );

        const { result, waitFor } = renderHook(() =>
            useLocalStorage('test-key', {})
        );

        await waitFor(() =>
            expect(result.current).toEqual([
                { key: 'value' },
                expect.any(Function),
            ])
        );
    });

    it('sets new value to local storage', async () => {
        const setItem = vi.spyOn(Storage.prototype, 'setItem');
        const { result } = renderHook(() =>
            useLocalStorage('test-key', { key: 'initial-value' })
        );

        await act(async () => {
            result.current[1]({ key: 'new-value' });
        });

        expect(setItem).toHaveBeenCalledWith(
            ':test-key:useLocalStorage:v1',
            JSON.stringify({ key: 'new-value' })
        );
    });
});
