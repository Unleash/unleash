import React, { useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend,
    ChartOptions,
    TimeScale,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import faker from 'faker';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { useTheme } from '@mui/material';
import { formatDateHM, formatDateYMDHMS } from 'utils/formatDate';
import { IFeatureFeedback } from 'interfaces/featureFeedback';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    TimeScale,
    Title,
    Tooltip,
    Filler,
    Legend
);

const colors = [
    '#00876c',
    '#7db168',
    '#e5d272',
    '#e78c4a',
    '#d43d51',
].reverse();
const hexToRgb = (hex: string) => {
    var bigint = parseInt(hex.replace('#', ''), 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return r + ',' + g + ',' + b;
};

// export const data = {
//     labels,
//     datasets: [
//         {
//             fill: true,
//             label: '1',
//             data: labels.map(
//                 () => faker.datatype.number({ min: 1, max: 5 }) - 1
//             ),
//             borderColor: colors[0],
//             backgroundColor: `rgba(${hexToRgb(colors[0])}, 0.2)`,
//         },
//         {
//             fill: true,
//             label: '2',
//             data: labels.map(() => faker.datatype.number({ min: 1, max: 5 })),
//             borderColor: colors[1],
//             backgroundColor: `rgba(${hexToRgb(colors[1])}, 0.2)`,
//         },
//         {
//             fill: true,
//             label: '3',
//             data: labels.map(() => faker.datatype.number({ min: 0, max: 1 })),
//             borderColor: colors[2],
//             backgroundColor: `rgba(${hexToRgb(colors[2])}, 0.2)`,
//         },
//         {
//             fill: true,
//             label: '4',
//             data: labels.map(() => faker.datatype.number({ min: 1, max: 3 })),
//             borderColor: colors[3],
//             backgroundColor: `rgba(${hexToRgb(colors[3])}, 0.2)`,
//         },
//         {
//             fill: true,
//             label: '5',
//             data: labels.map(() => faker.datatype.number({ min: 1, max: 7 })),
//             borderColor: colors[4],
//             backgroundColor: `rgba(${hexToRgb(colors[4])}, 0.2)`,
//         },
//     ],
// };

export const FeatureChart = ({
    feedback,
}: {
    feedback: IFeatureFeedback[];
}) => {
    const theme = useTheme();
    const { locationSettings } = useLocationSettings();
    const feedbackByPayload = useMemo(() => {
        const grouped = feedback.reduce((acc, curr) => {
            const payload = curr.payload;
            if (!acc[payload]) {
                acc[payload] = [];
            }
            acc[payload].push(curr);
            return acc;
        }, {} as Record<string, IFeatureFeedback[]>);
        return Object.entries(grouped).map(([key, value]) => ({
            payload: key,
            feedback: value,
        }));
    }, [feedback]);
    // map feedbackByPayload to 1min intervals 1h back

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const labels = Array.from(
        { length: 60 },
        (_, i) => new Date(oneHourAgo.getTime() + i * 60 * 1000)
    );

    const data = useMemo(() => {
        const datasets = feedbackByPayload.map(({ feedback, payload }, i) => {
            console.log({
                labels,
                f: feedback.map(q =>
                    formatDateHM(q.createdAt, locationSettings.locale)
                ),
            });
            const data = labels.map(label => {
                const count = feedback.filter(
                    item =>
                        item.payload === payload &&
                        new Date(item.createdAt).getTime() <= label.getTime()
                ).length;
                return count;
            });
            return {
                fill: true,
                label: payload,
                data,
                borderColor: colors[i || 0],
                backgroundColor: `rgba(${hexToRgb(colors[i || 0])}, 0.2)`,
            };
        });
        return {
            labels: labels.map(label =>
                formatDateHM(label, locationSettings.locale)
            ),
            datasets,
        };
    }, [feedbackByPayload, labels, locationSettings.locale]);

    // const sortedMetrics = useMemo(() => {
    //     return [...metrics].sort((metricA, metricB) => {
    //         return metricA.timestamp.localeCompare(metricB.timestamp);
    //     });
    // }, [metrics]);

    const options = useMemo<ChartOptions<'line'>>(
        () => ({
            responsive: true,
            color: theme.palette.text.secondary,
            plugins: {
                legend: {
                    position: 'top' as const,
                },
                // title: {
                //     display: true,
                //     text: 'Chart.js Line Chart',
                // },
            },
            scales: {
                y: {
                    type: 'linear',
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Number of feedback submissions',
                        color: theme.palette.text.secondary,
                    },
                    // min: 0,
                    suggestedMin: 0,
                    ticks: {
                        precision: 0,
                        color: theme.palette.text.secondary,
                    },
                    grid: {
                        color: theme.palette.divider,
                        borderColor: theme.palette.divider,
                    },
                },
                // x: {
                //     type: 'time',
                //     time: { unit: 'hour' },
                //     grid: { display: false },
                //     ticks: {
                //         callback: (_, i, data) =>
                //             formatDateYMDHMS(
                //                 data[i].value,
                //                 locationSettings.locale
                //             ),
                //         color: theme.palette.text.secondary,
                //     },
                // },
            },
        }),
        [theme, locationSettings]
    );

    return <Line options={options} data={data} />;
};
