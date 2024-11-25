import type { FC } from 'react';
import 'chartjs-adapter-date-fns';
import type { LicensedUsersSchema } from 'openapi';
import { LineChart } from 'component/insights/components/LineChart/LineChart';
import { useTheme } from '@mui/material';

interface ILicensedUsersChartProps {
    licensedUsers: LicensedUsersSchema['licensedUsers']['history'];
}

export const LicensedUsersChart: FC<ILicensedUsersChartProps> = ({
    licensedUsers,
}) => {
    const theme = useTheme();

    const data = {
        datasets: [
            {
                label: 'Licensed users',
                data: licensedUsers,
                borderColor: theme.palette.primary.main,
                backgroundColor: theme.palette.primary.main,
                fill: false,
            },
        ],
    };
    return (
        <LineChart
            data={data}
            overrideOptions={{
                parsing: {
                    yAxisKey: 'count',
                    xAxisKey: 'date',
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        type: 'linear',
                        grid: {
                            color: theme.palette.divider,
                            borderColor: theme.palette.divider,
                        },
                        ticks: {
                            color: theme.palette.text.secondary,
                            display: true,
                            precision: 0,
                        },
                    },
                    x: {
                        type: 'time',
                        time: {
                            unit: 'month',
                            tooltipFormat: 'MMM yyyy',
                            displayFormats: {
                                month: 'MMM',
                            },
                        },
                        grid: {
                            color: 'transparent',
                            borderColor: 'transparent',
                        },
                        ticks: {
                            color: theme.palette.text.secondary,
                            display: true,
                            source: 'data',
                            maxRotation: 90,
                            minRotation: 23.5,
                        },
                    },
                },
            }}
        />
    );
};
