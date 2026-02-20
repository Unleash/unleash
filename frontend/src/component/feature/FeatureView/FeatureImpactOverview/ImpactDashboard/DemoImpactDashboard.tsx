import type { FC } from 'react';
import { Box, Paper, styled, Typography } from '@mui/material';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    annotationPlugin,
);

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
    padding: theme.spacing(1),
}));

const StyledChartsGrid = styled('div')(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: theme.spacing(3),
    [theme.breakpoints.down('md')]: {
        gridTemplateColumns: '1fr',
    },
}));

const StyledChartCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: theme.shape.borderRadiusMedium,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: 'none',
}));

const StyledChartHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
}));

const StyledChartTitle = styled(Typography)(({ theme }) => ({
    fontWeight: theme.typography.fontWeightMedium,
}));

const StyledChartSubtitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    color: theme.palette.text.secondary,
}));

// Generate mock time series data
const generateMockData = (
    days: number,
    baseValue: number,
    variance: number,
    trend: number = 0,
): number[] => {
    const data: number[] = [];
    for (let i = days; i >= 0; i--) {
        const trendAdjustment = trend * (days - i);
        const value =
            baseValue +
            trendAdjustment +
            (Math.random() - 0.5) * variance * 2;
        data.push(Math.max(0, Math.round(value * 100) / 100));
    }
    return data;
};

// Generate labels for the last N days
const generateLabels = (days: number): string[] => {
    const labels: string[] = [];
    const now = new Date();
    for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        labels.push(
            date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        );
    }
    return labels;
};

// Mock event markers (strategy changes, etc.)
const mockEvents = [
    { day: 5, type: 'enabled', label: 'Enabled in production' },
    { day: 3, type: 'strategy', label: 'Rollout increased to 50%' },
    { day: 1, type: 'strategy', label: 'Rollout increased to 100%' },
];

const getEventAnnotations = (days: number, events: typeof mockEvents) => {
    const annotations: Record<string, object> = {};

    events.forEach((event, index) => {
        // Vertical line with hover-to-reveal label
        annotations[`event-${index}`] = {
            type: 'line' as const,
            xMin: days - event.day,
            xMax: days - event.day,
            borderColor: 'rgba(120, 120, 120, 0.5)',
            borderWidth: 1,
            borderDash: [4, 3],
            label: {
                display: false,
                content: event.label,
                position: 'start' as const,
                backgroundColor: 'rgba(80, 80, 80, 0.9)',
                color: 'white',
                font: { size: 11 },
                padding: { top: 4, bottom: 4, left: 8, right: 8 },
                borderRadius: 4,
            },
            enter(ctx: { element: { label: { options: { display: boolean } } } }) {
                ctx.element.label.options.display = true;
                return true;
            },
            leave(ctx: { element: { label: { options: { display: boolean } } } }) {
                ctx.element.label.options.display = false;
                return true;
            },
        };
    });

    return annotations;
};

export const DemoImpactDashboard: FC = () => {
    const days = 7;
    const labels = generateLabels(days);

    // Conversion rate data - showing improvement after feature enabled
    const conversionData = {
        labels,
        datasets: [
            {
                label: 'Conversion Rate',
                data: generateMockData(days, 3.2, 0.3, 0.15),
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 6,
            },
        ],
    };

    // Error rate data - showing decrease after feature enabled
    const errorData = {
        labels,
        datasets: [
            {
                label: 'Error Rate',
                data: generateMockData(days, 2.1, 0.4, -0.2),
                borderColor: 'rgb(239, 68, 68)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 6,
            },
        ],
    };

    const chartOptions = (_title: string, yAxisSuffix: string = '%') => ({
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            intersect: false,
            mode: 'index' as const,
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: (context: { parsed: { y: number } }) =>
                        `${context.parsed.y.toFixed(2)}${yAxisSuffix}`,
                },
            },
            annotation: {
                annotations: getEventAnnotations(days, mockEvents) as Record<string, object>,
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    maxTicksLimit: 7,
                },
            },
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (value: number | string) => `${value}${yAxisSuffix}`,
                },
            },
        },
    });

    return (
        <StyledContainer>
            <StyledChartsGrid>
                <StyledChartCard>
                    <StyledChartHeader>
                        <div>
                            <StyledChartTitle variant='subtitle1'>
                                Conversion Rate
                            </StyledChartTitle>
                            <StyledChartSubtitle>
                                Last 7 days · Avg aggregation
                            </StyledChartSubtitle>
                        </div>
                        <Typography
                            variant='h6'
                            color='success.main'
                            sx={{ fontWeight: 600 }}
                        >
                            +12.4%
                        </Typography>
                    </StyledChartHeader>
                    <Box sx={{ height: 200 }}>
                        <Line
                            data={conversionData}
                            options={chartOptions('Conversion Rate')}
                        />
                    </Box>
                </StyledChartCard>

                <StyledChartCard>
                    <StyledChartHeader>
                        <div>
                            <StyledChartTitle variant='subtitle1'>
                                Error Rate
                            </StyledChartTitle>
                            <StyledChartSubtitle>
                                Last 7 days · Avg aggregation
                            </StyledChartSubtitle>
                        </div>
                        <Typography
                            variant='h6'
                            color='success.main'
                            sx={{ fontWeight: 600 }}
                        >
                            -34.2%
                        </Typography>
                    </StyledChartHeader>
                    <Box sx={{ height: 200 }}>
                        <Line
                            data={errorData}
                            options={chartOptions('Error Rate')}
                        />
                    </Box>
                </StyledChartCard>
            </StyledChartsGrid>
        </StyledContainer>
    );
};
