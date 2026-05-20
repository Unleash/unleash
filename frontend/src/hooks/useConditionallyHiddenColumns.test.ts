import { describe, expect, test } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { Updater, VisibilityState } from '@tanstack/react-table';
import { useConditionallyHiddenColumns } from './useConditionallyHiddenColumns.ts';

const createSetVisibility = () => {
    let state: VisibilityState = {};
    const setColumnVisibility = (updater: Updater<VisibilityState>) => {
        state = typeof updater === 'function' ? updater(state) : updater;
    };
    return { setColumnVisibility, getState: () => state };
};

describe('useConditionallyHiddenColumns', () => {
    test('hide wins when a column appears in both a true and a false condition', () => {
        const { setColumnVisibility, getState } = createSetVisibility();

        renderHook(() =>
            useConditionallyHiddenColumns(
                [
                    { condition: true, columns: ['Icon', 'seenAt'] },
                    {
                        condition: false,
                        columns: ['Icon', 'seenAt', 'project'],
                    },
                ],
                setColumnVisibility,
                [],
            ),
        );

        expect(getState()).toEqual({
            Icon: false,
            seenAt: false,
            project: true,
        });
    });
});
