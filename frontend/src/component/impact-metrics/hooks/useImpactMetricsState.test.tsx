import { render } from 'utils/testRenderer';
import { useImpactMetricsState } from './useImpactMetricsState.ts';
import { Route, Routes } from 'react-router-dom';
import { createLocalStorage } from '../../../utils/createLocalStorage.ts';
import type { FC } from 'react';
import type { ImpactMetricsState } from '../types.ts';

const TestComponent: FC = () => {
    const { charts, layout } = useImpactMetricsState();

    return (
        <div>
            <span data-testid='charts-count'>{charts.length}</span>
            <span data-testid='layout-count'>{layout.length}</span>
        </div>
    );
};

const TestWrapper = () => (
    <Routes>
        <Route path='/impact-metrics' element={<TestComponent />} />
    </Routes>
);

describe('useImpactMetricsState', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it('loads state from localStorage to the URL after opening page without URL state', async () => {
        const { setValue } = createLocalStorage<ImpactMetricsState>(
            'impact-metrics-state',
            {
                charts: [],
                layout: [],
            },
        );

        setValue({
            charts: [
                {
                    id: 'test-chart',
                    selectedSeries: 'test-series',
                    selectedRange: 'day' as const,
                    beginAtZero: true,
                    selectedLabels: {},
                    title: 'Test Chart',
                },
            ],
            layout: [
                {
                    i: 'test-chart',
                    x: 0,
                    y: 0,
                    w: 6,
                    h: 4,
                    minW: 4,
                    minH: 2,
                    maxW: 12,
                    maxH: 8,
                },
            ],
        });

        render(<TestWrapper />, { route: '/impact-metrics' });

        expect(window.location.href).toContain('charts=');
        expect(window.location.href).toContain('layout=');
    });

    it('does not modify URL when URL already contains data', async () => {
        const { setValue } = createLocalStorage<ImpactMetricsState>(
            'impact-metrics-state',
            {
                charts: [],
                layout: [],
            },
        );

        setValue({
            charts: [
                {
                    id: 'old-chart',
                    selectedSeries: 'old-series',
                    selectedRange: 'day' as const,
                    beginAtZero: true,
                    selectedLabels: {},
                    title: 'Old Chart',
                },
            ],
            layout: [],
        });

        const urlCharts = btoa(
            JSON.stringify([
                {
                    id: 'url-chart',
                    selectedSeries: 'url-series',
                    selectedRange: 'day',
                    beginAtZero: true,
                    selectedLabels: {},
                    title: 'URL Chart',
                },
            ]),
        );

        render(<TestWrapper />, {
            route: `/impact-metrics?charts=${encodeURIComponent(urlCharts)}`,
        });

        const urlParams = new URLSearchParams(window.location.search);
        const chartsParam = urlParams.get('charts');

        expect(chartsParam).toBeTruthy();

        const decodedCharts = JSON.parse(atob(chartsParam!));
        expect(decodedCharts[0].id).toBe('url-chart');
        expect(decodedCharts[0].id).not.toBe('old-chart');
    });
});
