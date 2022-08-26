import { renderHook, act } from '@testing-library/react-hooks';
import { useOverrides } from './useOverrides';

describe('useOverrides', () => {
    it('should return initial value', () => {
        const { result } = renderHook(() =>
            useOverrides([{ contextName: 'context', values: ['a', 'b'] }])
        );

        expect(result.current[0]).toEqual([
            { contextName: 'context', values: ['a', 'b'] },
        ]);
    });

    it('should set value with an action', () => {
        const { result } = renderHook(() =>
            useOverrides([
                { contextName: 'X', values: ['a', 'b'] },
                { contextName: 'Y', values: ['a', 'b', 'c'] },
            ])
        );

        const [, dispatch] = result.current;
        act(() => {
            dispatch({
                type: 'SET',
                payload: [{ contextName: 'Z', values: ['d'] }],
            });
        });

        expect(result.current[0]).toEqual([
            { contextName: 'Z', values: ['d'] },
        ]);
    });

    it('should clear all overrides with an action', () => {
        const { result } = renderHook(() =>
            useOverrides([
                { contextName: 'X', values: ['a', 'b'] },
                { contextName: 'Y', values: ['a', 'b', 'c'] },
            ])
        );

        const [, dispatch] = result.current;
        act(() => {
            dispatch({
                type: 'CLEAR',
            });
        });

        expect(result.current[0]).toEqual([]);
    });

    it('should add value with an action', () => {
        const { result } = renderHook(() =>
            useOverrides([
                { contextName: 'X', values: ['a'] },
                { contextName: 'Y', values: ['b'] },
            ])
        );

        const [, dispatch] = result.current;
        act(() => {
            dispatch({
                type: 'ADD',
                payload: { contextName: 'Z', values: ['c'] },
            });
        });

        expect(result.current[0]).toEqual([
            { contextName: 'X', values: ['a'] },
            { contextName: 'Y', values: ['b'] },
            { contextName: 'Z', values: ['c'] },
        ]);
    });

    it('should remove override at index with an action', () => {
        const { result } = renderHook(() =>
            useOverrides([
                { contextName: '1', values: [] },
                { contextName: '2', values: ['a'] },
                { contextName: '3', values: ['b'] },
                { contextName: '4', values: ['c'] },
            ])
        );

        const [, dispatch] = result.current;

        act(() => {
            dispatch({ type: 'REMOVE', payload: 1 });
        });
        expect(result.current[0]).toEqual([
            { contextName: '1', values: [] },
            { contextName: '3', values: ['b'] },
            { contextName: '4', values: ['c'] },
        ]);

        act(() => {
            dispatch({ type: 'REMOVE', payload: 2 });
        });
        expect(result.current[0]).toEqual([
            { contextName: '1', values: [] },
            { contextName: '3', values: ['b'] },
        ]);
    });

    it('should update at index with an action', () => {
        const { result } = renderHook(() =>
            useOverrides([
                { contextName: '1', values: [] },
                { contextName: '2', values: ['a'] },
                { contextName: '3', values: ['b'] },
            ])
        );

        const [, dispatch] = result.current;

        act(() => {
            dispatch({
                type: 'UPDATE_VALUES_AT',
                payload: [1, ['x', 'y', 'z']],
            });
        });
        expect(result.current[0]).toEqual([
            { contextName: '1', values: [] },
            { contextName: '2', values: ['x', 'y', 'z'] },
            { contextName: '3', values: ['b'] },
        ]);
    });

    it('should change context at index with an action', () => {
        const { result } = renderHook(() =>
            useOverrides([
                { contextName: '1', values: ['x'] },
                { contextName: '2', values: ['y'] },
                { contextName: '3', values: ['z'] },
            ])
        );

        const [, dispatch] = result.current;

        act(() => {
            dispatch({
                type: 'UPDATE_TYPE_AT',
                payload: [1, 'NewContext'],
            });
        });
        expect(result.current[0]).toEqual([
            { contextName: '1', values: ['x'] },
            { contextName: 'NewContext', values: ['y'] },
            { contextName: '3', values: ['z'] },
        ]);
    });
});
