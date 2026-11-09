import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useCustomEvent } from './useCustomEvent.ts';

const renderListener = (eventName: string) => {
    const handledBy: string[] = [];
    const handlerNamed = (name: string) => () => handledBy.push(name);
    const hook = renderHook(
        ({ handler }) => useCustomEvent(eventName, handler),
        { initialProps: { handler: handlerNamed('first') } },
    );
    return { hook, handledBy, handlerNamed };
};

const dispatch = (eventName: string) =>
    act(() => {
        document.dispatchEvent(new CustomEvent(eventName));
    });

describe('useCustomEvent', () => {
    it('handles an emitted event with the latest handler', () => {
        const { hook, handledBy, handlerNamed } =
            renderListener('flag-created');

        hook.rerender({ handler: handlerNamed('second') });
        act(() => hook.result.current.emitEvent());

        expect(handledBy).toEqual(['second']);
    });

    it('ignores events with other names', () => {
        const { handledBy } = renderListener('flag-created');

        dispatch('flag-archived');

        expect(handledBy).toEqual([]);
    });

    it('stops handling events after unmount', () => {
        const { hook, handledBy } = renderListener('flag-created');

        hook.unmount();
        dispatch('flag-created');

        expect(handledBy).toEqual([]);
    });
});
