import { vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useConstraintTooltips } from './useConstraintTooltips.js';
import useUnleashContext from 'hooks/api/getters/useUnleashContext/useUnleashContext';

vi.mock('hooks/api/getters/useUnleashContext/useUnleashContext', () => ({
    default: vi.fn(),
}));

describe('useConstraintTooltips', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('returns tooltip mapping for legal values with descriptions', () => {
        (
            useUnleashContext as unknown as ReturnType<typeof vi.fn>
        ).mockReturnValue({
            context: [
                {
                    name: 'contextA',
                    description: 'Test context A',
                    createdAt: '2021-01-01',
                    sortOrder: 1,
                    stickiness: false,
                    legalValues: [
                        { value: 'value1', description: 'Tooltip 1' },
                        { value: 'value2', description: 'Tooltip 2' },
                        { value: 'value3' }, // No description provided
                    ],
                },
            ],
        });

        const { result } = renderHook(() =>
            useConstraintTooltips('contextA', [
                'value1',
                'value2',
                'value3',
                'nonExisting',
            ]),
        );

        expect(result.current).toEqual({
            value1: 'Tooltip 1',
            value2: 'Tooltip 2',
        });
    });

    it('returns an empty object when the context is not found', () => {
        (
            useUnleashContext as unknown as ReturnType<typeof vi.fn>
        ).mockReturnValue({
            context: [
                {
                    name: 'otherContext',
                    description: 'Other context',
                    createdAt: '2021-01-01',
                    sortOrder: 1,
                    stickiness: false,
                    legalValues: [
                        { value: 'value1', description: 'Tooltip 1' },
                    ],
                },
            ],
        });

        const { result } = renderHook(() =>
            useConstraintTooltips('contextA', ['value1']),
        );

        expect(result.current).toEqual({});
    });

    it('returns an empty object when no values are provided', () => {
        (
            useUnleashContext as unknown as ReturnType<typeof vi.fn>
        ).mockReturnValue({
            context: [
                {
                    name: 'contextA',
                    description: 'Test context A',
                    createdAt: '2021-01-01',
                    sortOrder: 1,
                    stickiness: false,
                    legalValues: [
                        { value: 'value1', description: 'Tooltip 1' },
                    ],
                },
            ],
        });

        const { result } = renderHook(() =>
            useConstraintTooltips('contextA', []),
        );

        expect(result.current).toEqual({});
    });
});
