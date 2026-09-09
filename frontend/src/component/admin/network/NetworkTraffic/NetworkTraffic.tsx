import { useInstanceMetrics } from 'hooks/api/getters/useInstanceMetrics/useInstanceMetrics';
import { useMemo, type FC } from 'react';
import type { ChartDataset, ChartOptions } from 'chart.js';
import type { RequestsPerSecondSchema } from 'openapi';
import { Alert, Box, useTheme } from '@mui/material';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { usePageTitle } from 'hooks/usePageTitle';
import { unknownify } from 'utils/unknownify';
import type { Theme } from '@mui/material/styles';
import { LineChart } from 'component/insights/components/LineChart/LineChart';
import { WidgetTitle } from 'component/insights/components/WidgetTitle/WidgetTitle';
import { NetworkPrometheusAPIWarning } from '../NetworkPrometheusAPIWarning.tsx';
import {
    alignToTimestamps,
    collectTimestamps,
    isIsolatedSample,
    type AlignedPoint,
    type ResultValue,
} from './align-series.ts';

type ChartDatasetType = ChartDataset<'line', AlignedPoint[]>;

const overrideOptions: ChartOptions<'line'> = {
    scales: {
        x: {
            time: {
                unit: 'hour',
                tooltipFormat: 'PPp',
                displayFormats: { hour: 'p' },
            },
            ticks: {
                source: 'auto',
                maxRotation: 0,
                minRotation: 0,
                maxTicksLimit: 8,
            },
        },
        y: {
            title: {
                display: true,
                text: 'Requests per second',
            },
            ticks: { precision: 2 },
        },
    },
    interaction: { mode: 'index', axis: 'x' },
    elements: {
        point: {
            // Points are hidden to match the analytics charts, but a sample
            // with a gap on both sides draws no line segment either, so it
            // would be invisible without a marker.
            radius: (ctx) =>
                isIsolatedSample(
                    ctx.dataset.data as AlignedPoint[],
                    ctx.dataIndex,
                )
                    ? 3
                    : 0,
        },
    },
    plugins: {
        tooltip: {
            itemSort: (a, b) => (b.parsed.y ?? 0) - (a.parsed.y ?? 0),
        },
    },
};

const toSeriesLabel = (metric?: {
    endpoint?: string;
    appName?: string;
}): string => `${unknownify(metric?.endpoint)}: ${unknownify(metric?.appName)}`;

const toChartData = (
    theme: Theme,
    rps?: RequestsPerSecondSchema,
): ChartDatasetType[] => {
    const results = rps?.data?.result;
    if (!results) {
        return [];
    }

    const seriesColors = theme.palette.charts.series;
    const labelsInColorOrder = results
        .map((dataset) => toSeriesLabel(dataset.metric))
        .sort();

    const allValues = results.map(
        (dataset) => (dataset.values || []) as ResultValue[],
    );
    const timestamps = collectTimestamps(allValues);

    return results.map((dataset, i) => {
        const label = toSeriesLabel(dataset.metric);
        const color =
            seriesColors[
                labelsInColorOrder.indexOf(label) % seriesColors.length
            ];
        return {
            label,
            borderColor: color,
            backgroundColor: color,
            data: alignToTimestamps(allValues[i], timestamps),
        };
    });
};

export const NetworkTraffic: FC = () => {
    const { metrics, loading } = useInstanceMetrics();
    const theme = useTheme();

    usePageTitle('Network - Traffic');

    const data = useMemo(() => {
        return { datasets: toChartData(theme, metrics) };
    }, [theme, metrics]);

    return (
        <ConditionallyRender
            condition={data.datasets.length === 0 && !loading}
            show={
                <Alert severity='warning'>
                    No data available.
                    <NetworkPrometheusAPIWarning />
                </Alert>
            }
            elseShow={
                <Box sx={{ display: 'grid', gap: 4 }}>
                    <WidgetTitle title='Top 10 requests per second in the last 6 hours' />
                    <LineChart
                        data={data}
                        overrideOptions={overrideOptions}
                        cover={loading}
                    />
                </Box>
            }
        />
    );
};

// Use a default export to lazy-load the charting library.
export default NetworkTraffic;
