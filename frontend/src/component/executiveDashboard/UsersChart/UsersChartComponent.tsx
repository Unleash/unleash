import { useMemo, useState, type VFC } from 'react';
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
    Chart,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { Paper, Theme, Typography, useTheme } from '@mui/material';
import {
    useLocationSettings,
    type ILocationSettings,
} from 'hooks/useLocationSettings';
import { ExecutiveSummarySchema } from 'openapi';
import { ChartTooltip, TooltipState } from './ChartTooltip/ChartTooltip';

const createOptions = (
    theme: Theme,
    locationSettings: ILocationSettings,
    setTooltip: React.Dispatch<React.SetStateAction<TooltipState | null>>,
) =>
    ({
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 12,
                    padding: 30,
                    // usePointStyle: true,
                    generateLabels: (chart: Chart) => {
                        const datasets = chart.data.datasets;
                        const {
                            labels: {
                                usePointStyle,
                                pointStyle,
                                textAlign,
                                color,
                            },
                        } = chart?.legend?.options || {
                            labels: {},
                        };
                        return (chart as any)
                            ._getSortedDatasetMetas()
                            .map((meta: any) => {
                                const style = meta.controller.getStyle(
                                    usePointStyle ? 0 : undefined,
                                );
                                return {
                                    text: datasets[meta.index].label,
                                    fillStyle: style.backgroundColor,
                                    fontColor: color,
                                    hidden: !meta.visible,
                                    lineWidth: 0,
                                    borderRadius: 6,
                                    strokeStyle: style.borderColor,
                                    pointStyle: pointStyle || style.pointStyle,
                                    textAlign: textAlign || style.textAlign,
                                    datasetIndex: meta.index,
                                };
                            });
                    },
                },
            },
            tooltip: {
                enabled: false,
                external: (context: any) => {
                    const tooltipModel = context.tooltip;
                    if (tooltipModel.opacity === 0) {
                        setTooltip(null);
                        return;
                    }

                    const tooltip = context.tooltip;
                    setTooltip({
                        caretX: tooltip?.caretX,
                        caretY: tooltip?.caretY,
                        title: tooltip?.title?.join(' ') || '',
                        align: tooltip?.xAlign || 'left',
                        body:
                            tooltip?.body?.map((item: any, index: number) => ({
                                title: item?.lines?.join(' '),
                                color: tooltip?.labelColors?.[index]
                                    ?.borderColor,
                            })) || [],
                    });
                },
            },
        },
        locale: locationSettings.locale,
        interaction: {
            intersect: false,
            axis: 'x',
        },
        elements: {
            point: {
                radius: 0,
            },
        },
        // cubicInterpolationMode: 'monotone',
        color: theme.palette.text.secondary,
        scales: {
            y: {
                beginAtZero: true,
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

interface IUsersChartComponentProps {
    userTrends: ExecutiveSummarySchema['userTrends'];
}

const createData = (
    theme: Theme,
    userTrends: ExecutiveSummarySchema['userTrends'],
) => ({
    labels: userTrends.map((item) => item.date),
    datasets: [
        {
            label: 'Total users',
            data: userTrends.map((item) => item.total),
            borderColor: theme.palette.primary.light,
            backgroundColor: theme.palette.primary.light,
            fill: true,
        },
        {
            label: 'Active users',
            data: userTrends.map((item) => item.active),
            borderColor: theme.palette.success.border,
            backgroundColor: theme.palette.success.border,
        },
        {
            label: 'Inactive users',
            data: userTrends.map((item) => item.inactive),
            borderColor: theme.palette.warning.border,
            backgroundColor: theme.palette.warning.border,
        },
    ],
});

const UsersChartComponent: VFC<IUsersChartComponentProps> = ({
    userTrends,
}) => {
    const theme = useTheme();
    const { locationSettings } = useLocationSettings();
    const data = useMemo(
        () => createData(theme, userTrends),
        [theme, userTrends],
    );

    const [tooltip, setTooltip] = useState<null | TooltipState>(null);
    const options = useMemo(
        () => createOptions(theme, locationSettings, setTooltip),
        [theme, locationSettings],
    );

    return (
        <Paper
            elevation={0}
            sx={(theme) => ({
                padding: theme.spacing(3),
                position: 'relative',
            })}
        >
            <Typography
                variant='h3'
                sx={(theme) => ({ marginBottom: theme.spacing(3) })}
            >
                Users
            </Typography>
            <Line options={options} data={data} />

            <ChartTooltip tooltip={tooltip} />
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

export default UsersChartComponent;
