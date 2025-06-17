import type { FC } from 'react';
import { useMemo } from 'react';
import { useTheme } from '@mui/material';
import { LineChart } from './components/LineChart/LineChart.tsx';
import { data } from './data.ts';

type TestComponentProps = {};

const transformTimeSeriesData = (rawData: typeof data) => {
    const firstDataset = rawData[0];
    const timeseries = firstDataset.data.values;
    const timestamps = timeseries[0];
    const values = timeseries[1];

    return {
        timestamps: timestamps.map((ts) => new Date(ts)),
        values,
    };
};

export const TestComponent: FC<TestComponentProps> = () => {
    const theme = useTheme();

    const chartData = useMemo(() => {
        const { timestamps, values } = transformTimeSeriesData(data);

        return {
            labels: timestamps,
            datasets: [
                {
                    data: values,
                    borderColor: theme.palette.primary.main,
                    backgroundColor: theme.palette.primary.light,
                    // tension: 0.1,
                    // pointRadius: 0,
                    // pointHoverRadius: 5,
                },
            ],
        };
    }, [theme]);

    return (
        <LineChart
            data={chartData}
            overrideOptions={{
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'hour',
                            displayFormats: {
                                hour: 'MMM dd HH:mm',
                            },
                            tooltipFormat: 'PPpp',
                        },
                        // title: {
                        //     display: true,
                        //     text: 'Time',
                        // },
                    },
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'User Count',
                        },
                        ticks: {
                            precision: 0,
                        },
                    },
                },
                plugins: {
                    legend: {
                        display: false,
                        // display: true,
                        // position: 'top',
                    },
                },
            }}
        />
    );
};
