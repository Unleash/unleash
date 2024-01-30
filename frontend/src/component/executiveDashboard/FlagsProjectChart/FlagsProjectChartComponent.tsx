import { useMemo, type VFC } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { Paper, Theme, Typography, useTheme } from '@mui/material';
import {
    useLocationSettings,
    type ILocationSettings,
} from 'hooks/useLocationSettings';
import { formatDateYMD } from 'utils/formatDate';
import {
    ExecutiveSummarySchema,
    ExecutiveSummarySchemaProjectFlagTrendsItem,
} from 'openapi';

const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

const createData = (
    theme: Theme,
    flagTrends: ExecutiveSummarySchema['projectFlagTrends'] = [],
) => {
    const groupedFlagTrends = flagTrends.reduce<
        Record<string, ExecutiveSummarySchemaProjectFlagTrendsItem[]>
    >((groups, item) => {
        if (!groups[item.project]) {
            groups[item.project] = [];
        }
        groups[item.project].push(item);
        return groups;
    }, {});

    const datasets = Object.entries(groupedFlagTrends).map(
        ([project, trends]) => {
            const color = getRandomColor();
            return {
                label: project,
                data: trends.map((item) => item.total),
                borderColor: color,
                backgroundColor: color,
                fill: true,
            };
        },
    );

    return {
        labels: flagTrends.map((item) => item.date),
        datasets,
    };
};

const createOptions = (theme: Theme, locationSettings: ILocationSettings) =>
    ({
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
            },
            tooltip: {
                callbacks: {
                    title: (tooltipItems: any) => {
                        const item = tooltipItems?.[0];
                        const date =
                            item?.chart?.data?.labels?.[item.dataIndex];
                        return date
                            ? formatDateYMD(date, locationSettings.locale)
                            : '';
                    },
                },
            },
        },
        locale: locationSettings.locale,
        interaction: {
            intersect: false,
            axis: 'x',
        },
        color: theme.palette.text.secondary,
        scales: {
            y: {
                type: 'linear',
                grid: {
                    color: theme.palette.divider,
                    borderColor: theme.palette.divider,
                },
                ticks: { color: theme.palette.text.secondary },
            },
            x: {
                type: 'time',
                time: {
                    unit: 'month',
                },
                grid: {
                    color: theme.palette.divider,
                    borderColor: theme.palette.divider,
                },
                ticks: {
                    color: theme.palette.text.secondary,
                },
            },
        },
    }) as const;

interface IFlagsChartComponentProps {
    projectFlagTrends: ExecutiveSummarySchema['projectFlagTrends'];
}

const FlagsProjectChart: VFC<IFlagsChartComponentProps> = ({
    projectFlagTrends,
}) => {
    const theme = useTheme();
    const { locationSettings } = useLocationSettings();
    const data = useMemo(
        () => createData(theme, projectFlagTrends),
        [theme, projectFlagTrends],
    );
    const options = createOptions(theme, locationSettings);

    return (
        <Paper sx={(theme) => ({ padding: theme.spacing(4) })}>
            <Typography
                variant='h3'
                sx={(theme) => ({ marginBottom: theme.spacing(3) })}
            >
                Number of flags per project
            </Typography>
            <Line options={options} data={data} />
        </Paper>
    );
};

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    TimeScale,
    Title,
    Tooltip,
    Legend,
);

export default FlagsProjectChart;
