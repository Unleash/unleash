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
                label: 'Seats used',
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
                plugins: {
                    legend: {
                        display: false,
                    },
                },
                scales: {
                    x: {
                        time: {
                            unit: 'month',
                            tooltipFormat: 'MMM yyyy',
                            displayFormats: {
                                month: 'MMM',
                            },
                        },
                    },
                },
            }}
        />
    );
};
