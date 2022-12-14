import {
    InstanceMetrics,
    useInstanceMetrics,
} from '../../../hooks/api/getters/useInstanceMetrics/useInstanceMetrics';
import { useMemo, VFC } from 'react';
import { Line } from 'react-chartjs-2';
import {
    CategoryScale,
    Chart as ChartJS,
    ChartData,
    ChartOptions,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    TimeScale,
    Title,
    Tooltip,
} from 'chart.js';
import {
    ILocationSettings,
    useLocationSettings,
} from '../../../hooks/useLocationSettings';
import theme from '../../../themes/theme';
import { formatDateHM } from '../../../utils/formatDate';
import { RequestsPerSecondSchema } from 'openapi';
import 'chartjs-adapter-date-fns';
import { PaletteColor } from '@mui/material';
import { PageContent } from '../../common/PageContent/PageContent';
import { PageHeader } from '../../common/PageHeader/PageHeader';
import { Box } from '@mui/system';
interface IPoint {
    x: number;
    y: number;
}

const createChartPoints = (
    values: Array<Array<number | string>>,
    y: (m: string) => number
): IPoint[] => {
    return values.map(row => ({
        x: row[0] as number,
        y: y(row[1] as string),
    }));
};
const createInstanceChartOptions = (
    metrics: InstanceMetrics,
    locationSettings: ILocationSettings
): ChartOptions<'line'> => {
    return {
        locale: locationSettings.locale,
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            tooltip: {
                backgroundColor: 'white',
                bodyColor: theme.palette.text.primary,
                titleColor: theme.palette.grey[700],
                borderColor: theme.palette.primary.main,
                borderWidth: 1,
                padding: 10,
                boxPadding: 5,
                usePointStyle: true,
                callbacks: {
                    title: items =>
                        formatDateHM(
                            1000 * items[0].parsed.x,
                            locationSettings.locale
                        ),
                },
                itemSort: (a, b) => b.parsed.y - a.parsed.y,
            },
            legend: {
                position: 'top',
                align: 'end',
                labels: {
                    boxWidth: 10,
                    boxHeight: 10,
                    usePointStyle: true,
                },
            },
            title: {
                text: 'Requests per second in the last 6 hours',
                position: 'top',
                align: 'start',
                display: true,
                font: {
                    size: 16,
                    weight: '400',
                },
            },
        },
        scales: {
            y: {
                type: 'linear',
                title: {
                    display: true,
                    text: 'Requests per second',
                },
                // min: 0,
                suggestedMin: 0,
                ticks: { precision: 0 },
            },
            x: {
                type: 'time',
                time: { unit: 'minute' },
                grid: { display: false },
                ticks: {
                    callback: (_, i, data) =>
                        formatDateHM(data[i].value, locationSettings.locale),
                },
            },
        },
    };
};

const toChartData = (
    rps: RequestsPerSecondSchema,
    color: PaletteColor,
    label: (name: string) => string
): any => {
    if (rps.data?.result) {
        return rps.data?.result.map(dataset => ({
            label: label(dataset.metric?.appName || 'unknown'),
            borderColor: color.main,
            backgroundColor: color.main,
            data: createChartPoints(dataset.values || [], y => parseFloat(y)),
            elements: {
                point: {
                    radius: 4,
                    pointStyle: 'circle',
                },
                line: {
                    borderDash: [8, 4],
                },
            },
        }));
    }
    return [];
};

const createInstanceChartData = (
    metrics?: InstanceMetrics
): ChartData<'line', IPoint[], string> => {
    if (metrics) {
        let datasets = []
            .concat(
                toChartData(
                    metrics?.clientMetrics,
                    theme.palette.primary,
                    metricName => `${metricName}:/api/client/*`
                )
            )
            .concat(
                toChartData(
                    metrics?.adminMetrics,
                    theme.palette.info,
                    metricName => `${metricName}:/api/admin/*`
                )
            );
        return { datasets };
    }
    return { datasets: [] };
};
export const InstanceMetricsChart: VFC = () => {
    const { locationSettings } = useLocationSettings();
    const { metrics } = useInstanceMetrics();
    const options = useMemo(() => {
        return createInstanceChartOptions(metrics, locationSettings);
    }, [metrics, locationSettings]);

    const data = useMemo(() => {
        return createInstanceChartData(metrics);
    }, [metrics, locationSettings]);

    return (
        <PageContent header={<PageHeader title="Requests per second" />}>
            <Box sx={{ display: 'grid', gap: 4 }}>
                <div style={{ height: 400 }}>
                    <Line
                        data={data}
                        options={options}
                        aria-label="An instance metrics line chart with two lines: requests per second for admin API and requests per second for client API"
                    />
                </div>
            </Box>
        </PageContent>
    );
};
// Register dependencies that we need to draw the chart.
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    TimeScale,
    Legend,
    Tooltip,
    Title
);

// Use a default export to lazy-load the charting library.
export default InstanceMetricsChart;
