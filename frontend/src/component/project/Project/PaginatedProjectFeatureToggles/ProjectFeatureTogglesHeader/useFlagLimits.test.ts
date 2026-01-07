import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useFlagLimits } from './useFlagLimits.js';

vi.mock('hooks/useUiFlag', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as {}),
        useUiFlag: (flag: string) => flag === 'resourceLimits',
    };
});

test('if both global and project-level limits are reached, then the error message shows the message for instance-wide limits', () => {
    const { result } = renderHook(() =>
        useFlagLimits({
            global: { limit: 1, count: 1 },
            project: { limit: 1, count: 1 },
        }),
    );

    expect(result.current).toMatchObject({
        globalFlagLimitReached: true,
        projectFlagLimitReached: true,
        limitMessage: expect.stringContaining('instance-wide limit'),
    });
});

test('if only global level is reached, the projectFlagLimitReached property is false', () => {
    const { result } = renderHook(() =>
        useFlagLimits({
            global: { limit: 1, count: 1 },
            project: { limit: 1, count: 0 },
        }),
    );

    expect(result.current).toMatchObject({
        globalFlagLimitReached: true,
        projectFlagLimitReached: false,
        limitMessage: expect.stringContaining('instance-wide limit'),
    });
});

test('if only the project limit is reached, the limit message talks about the project limit', () => {
    const { result } = renderHook(() =>
        useFlagLimits({
            global: { limit: 2, count: 1 },
            project: { limit: 1, count: 1 },
        }),
    );

    expect(result.current).toMatchObject({
        globalFlagLimitReached: false,
        projectFlagLimitReached: true,
        limitMessage: expect.stringContaining('project limit'),
    });
});

test('if neither limit is reached, the limit message is undefined', () => {
    const { result } = renderHook(() =>
        useFlagLimits({
            global: { limit: 1, count: 0 },
            project: { limit: 1, count: 0 },
        }),
    );

    expect(result.current).toMatchObject({
        globalFlagLimitReached: false,
        projectFlagLimitReached: false,
        limitMessage: undefined,
    });
});
