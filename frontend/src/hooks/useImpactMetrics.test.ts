import { renderHook } from '@testing-library/react';
import { useImpactMetricsHistogram } from './useImpactMetrics';
import { vi } from 'vitest';

const mockClient = {
    impactMetrics: {
        defineCounter: vi.fn(),
        defineHistogram: vi.fn(),
        incrementCounter: vi.fn(),
        observeHistogram: vi.fn(),
    },
};

vi.mock('@unleash/proxy-client-react', () => ({
    useUnleashClient: () => mockClient,
}));

afterEach(() => {
    vi.clearAllMocks();
});

describe('useImpactMetricsHistogram', () => {
    test('defines histogram on mount', () => {
        renderHook(() =>
            useImpactMetricsHistogram('my_histogram', 'A histogram', [1, 2, 3]),
        );

        expect(mockClient.impactMetrics.defineHistogram).toHaveBeenCalledWith(
            'my_histogram',
            'A histogram',
            [1, 2, 3],
        );
    });

    test('observe calls observeHistogram with name and value', () => {
        const { result } = renderHook(() =>
            useImpactMetricsHistogram('my_histogram', 'A histogram', [1, 2, 3]),
        );

        result.current.observe(2);

        expect(mockClient.impactMetrics.observeHistogram).toHaveBeenCalledWith(
            'my_histogram',
            2,
        );
    });
});
