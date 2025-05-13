import { renderHook } from '@testing-library/react';
import { useTheme } from '@mui/material';
import { useProjectColor } from './useProjectColor.js';
import { useFilledMetricsSummary } from './useFilledMetricsSummary.js';
import type { Theme } from '@mui/material/styles';
import type { InstanceInsightsSchema } from 'openapi';
import type { GroupedDataByProject } from './useGroupedProjectTrends.js';
import { vi, type Mock } from 'vitest';

vi.mock('@mui/material', () => ({
    useTheme: vi.fn(),
}));

vi.mock('./useProjectColor', () => ({
    useProjectColor: vi.fn(),
}));

// Mock data
const mockTheme: Partial<Theme> = {};
const mockGetProjectColor = (project: string) => `color-${project}`;
const mockFilteredMetricsSummaryTrends = {
    Project1: [{ date: '2024-01-01', totalRequests: 5 }],
    Project2: [{ date: '2024-01-02', totalRequests: 10 }],
} as unknown as GroupedDataByProject<
    InstanceInsightsSchema['metricsSummaryTrends']
>;
const mockAllDataPointsSorted = ['2024-01-01', '2024-01-02'];

beforeEach(() => {
    (useTheme as Mock).mockReturnValue(mockTheme);
    (useProjectColor as Mock).mockImplementation(() => mockGetProjectColor);
});

describe('useFilledMetricsSummary', () => {
    it('returns datasets with normalized data for each project', () => {
        const { result } = renderHook(() =>
            useFilledMetricsSummary(
                mockFilteredMetricsSummaryTrends,
                mockAllDataPointsSorted,
            ),
        );

        expect(result.current.datasets).toHaveLength(2); // Expect two projects
        expect(result.current.datasets[0].data).toHaveLength(2); // Each dataset should have data for both dates

        // Check for normalized missing data
        const project1DataFor20240102 = result.current.datasets
            .find((dataset) => dataset.label === 'Project1')
            ?.data.find((data) => data.date === '2024-01-02');
        expect(project1DataFor20240102).toEqual(
            expect.objectContaining({ totalRequests: 0 }),
        ); // Missing data should be filled with 0
    });
});
