import { type VFC } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import faker from 'faker';
import { Paper, Theme, useTheme } from '@mui/material';
import {
    useLocationSettings,
    type ILocationSettings,
} from 'hooks/useLocationSettings';

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];

const createData = (theme: Theme) => ({
    labels,
    datasets: [
        {
            label: 'Active users',
            data: labels.map(() =>
                faker.datatype.number({ min: 150, max: 200 }),
            ),
            borderColor: theme.palette.primary.main,
            backgroundColor: theme.palette.primary.main,
            fill: true,
        },
        {
            label: 'Inactive users',
            data: labels.map(() => faker.datatype.number({ min: 10, max: 50 })),
            borderColor: theme.palette.error.main,
            backgroundColor: theme.palette.error.main,
            fill: true,
        },
    ],
});

const createOptions = (theme: Theme, locationSettings: ILocationSettings) => ({
    responsive: true,
    plugins: {
        legend: {
            position: 'bottom' as const,
        },
        // title: {
        //     display: true,
        //     text: 'Chart.js Line Chart',
        // },
    },
    locale: locationSettings.locale,
    // maintainAspectRatio: false,
    // interaction: {
    //     mode: 'index',
    //     intersect: false,
    // },
    color: theme.palette.text.secondary,
});

const UsersChartComponent: VFC = () => {
    const theme = useTheme();
    const { locationSettings } = useLocationSettings();
    const data = createData(theme);
    const options = createOptions(theme, locationSettings);

    return (
        <Paper sx={(theme) => ({ padding: theme.spacing(4) })}>
            {/* <div>UsersChart</div> */}
            <Line options={options} data={data} />
        </Paper>
    );
};

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
);

export default UsersChartComponent;
