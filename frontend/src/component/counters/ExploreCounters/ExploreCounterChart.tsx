import { Line } from 'react-chartjs-2';
import type { IMetricsCount } from 'hooks/api/getters/useMetricCounters/useMetricCounters';
import type {} from 'chart.js';
import type { Theme } from '@mui/material/styles/createTheme';
import {
    useLocationSettings,
    type ILocationSettings,
} from 'hooks/useLocationSettings';
import { formatDateHM } from 'utils/formatDate';
import { useMemo } from 'react';
import { useTheme } from '@mui/material';
import { CyclicIterator } from 'utils/cyclicIterator';
import {
    CategoryScale,
    Chart as ChartJS,
    type ChartDataset,
    type ChartOptions,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    TimeScale,
    Title,
    Tooltip,
} from 'chart.js';

type ChartDatasetType = ChartDataset<'line', IPoint[]>;

export interface IPoint {
    x: Date;
    y: number;
}

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    TimeScale,
    Legend,
    Tooltip,
    Title,
);

export const createChartOptions = (
    theme: Theme,
    _metrics: IMetricsCount[],
    _hoursBack: number,
    locationSettings: ILocationSettings,
): ChartOptions<'line'> => {
    return {
        locale: locationSettings.locale,
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        color: theme.palette.text.secondary,
        scales: {
            y: {
                type: 'linear',
                title: {
                    display: true,
                    text: 'Count',
                    color: theme.palette.text.secondary,
                },
                suggestedMin: 0,
                ticks: { precision: 0, color: theme.palette.text.secondary },
                grid: {
                    color: theme.palette.divider,
                    borderColor: theme.palette.divider,
                },
            },
            x: {
                type: 'time',
                time: { unit: 'minute' },
                grid: { display: false },
                ticks: {
                    callback: (_, i, data) =>
                        formatDateHM(data[i].value, locationSettings.locale),
                    color: theme.palette.text.secondary,
                },
            },
        },
    };
};

export function buildMetricKey({ name, labels }: IMetricsCount): string {
    if (!labels || Object.keys(labels).length === 0) {
        return encodeURIComponent(name);
    }

    const labelParts = Object.entries(labels)
        .filter(([, v]) => v != null && v !== '') // robustness: ignore empties
        .sort(([a], [b]) => a.localeCompare(b)) // robustness: deterministic order
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);

    return [encodeURIComponent(name), ...labelParts].join('_');
}

const createChartPoint = (value: number, timestamp: Date): IPoint => {
    return {
        x: timestamp,
        y: value,
    };
};

class ItemPicker<T> {
    private items: CyclicIterator<T>;
    private picked: Map<string, T> = new Map();
    constructor(items: T[]) {
        this.items = new CyclicIterator<T>(items);
    }

    public pick(key: string): T {
        if (!this.picked.has(key)) {
            this.picked.set(key, this.items.next());
        }
        return this.picked.get(key)!;
    }
}

const toValues = (
    metrics: IMetricsCount[],
    _selectedLabels: string[],
    _selectedValues: string[],
) => {
    return metrics.reduce(
        (acc, metric) => {
            for (const [_key, _value] of Object.entries(metric.labels)) {
                const labelKey = buildMetricKey(metric);
                if (!acc[labelKey]) {
                    acc[labelKey] = [];
                }
                acc[labelKey].push({
                    count: metric.value,
                    timestamp: metric.timestamp,
                });
            }
            return acc;
        },
        {} as Record<string, { count: number; timestamp: Date }[]>,
    );
};

export const createChartData = (
    theme: Theme,
    metrics: IMetricsCount[],
    selectedLabels: string[],
    selectedLabelValues: string[],
    _locationSettings: ILocationSettings,
): ChartDatasetType[] => {
    const colorPicker = new ItemPicker([
        theme.palette.success,
        theme.palette.error,
        theme.palette.primary,
        theme.palette.warning,
        theme.palette.info,
        theme.palette.secondary,
    ]);
    const labelValues = toValues(metrics, selectedLabels, selectedLabelValues);
    const datasets = Object.entries(labelValues).map(([key, values]) => {
        const color = colorPicker.pick(key);
        return {
            label: key,
            data: values.map((value) =>
                createChartPoint(value.count, value.timestamp),
            ),
            borderColor: color.main,
            backgroundColor: color.main,
            fill: false,
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 5,
        };
    });
    return datasets;
};

export const ExploreCounterChart = ({
    selectedLabels,
    selectedLabelValues,
    filteredCounters,
    counter,
    setCounter,
}: {
    selectedLabels: string[];
    selectedLabelValues: string[];
    filteredCounters: IMetricsCount[];
    counter: string | undefined;
    setCounter: (counter: string) => void;
}) => {
    const theme = useTheme();
    const { locationSettings } = useLocationSettings();

    const options = useMemo(() => {
        return createChartOptions(
            theme,
            filteredCounters,
            10,
            locationSettings,
        );
    }, [theme, filteredCounters, locationSettings]);

    const data = useMemo(() => {
        return {
            datasets: createChartData(
                theme,
                filteredCounters,
                selectedLabels,
                selectedLabelValues,
                locationSettings,
            ),
        };
    }, [theme, filteredCounters, locationSettings]);

    return (
        <div style={{ height: 400 }}>
            <Line
                options={options}
                data={data}
                aria-label='Explore Counters Metrics Chart'
            />
        </div>
    );
};
