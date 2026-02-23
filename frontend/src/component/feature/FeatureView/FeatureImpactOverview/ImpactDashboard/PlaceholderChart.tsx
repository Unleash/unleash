import type { FC } from 'react';
import { Box, Paper, styled, Typography } from '@mui/material';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
);

const StyledChartCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadiusMedium,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: 'none',
    backgroundColor: theme.palette.background.paper,
    flex: 1,
    minWidth: 0,
}));

const StyledChartHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing(1.5),
}));

const StyledChartTitle = styled(Typography)(({ theme }) => ({
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.text.disabled,
    fontSize: theme.fontSizes.smallBody,
}));

const StyledChartSubtitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.disabled,
}));

const StyledChange = styled(Typography)(({ theme }) => ({
    fontWeight: 600,
    color: theme.palette.text.disabled,
    fontSize: theme.fontSizes.smallBody,
}));

// Static data for different chart types
const labels = ['', '', '', '', '', '', '', ''];
const upwardData = [2.8, 3.0, 2.9, 3.2, 3.1, 3.4, 3.6, 3.8];
const downwardData = [1.8, 1.6, 1.7, 1.4, 1.5, 1.2, 1.1, 0.9];
const stableData = [45, 47, 44, 46, 48, 45, 46, 47];

interface PlaceholderChartProps {
    title?: string;
    change?: string;
    variant?: 'upward' | 'downward' | 'stable';
}

export const PlaceholderChart: FC<PlaceholderChartProps> = ({
    title = 'Conversion Rate',
    change = '+12.4%',
    variant = 'upward',
}) => {
    const dataMap = {
        upward: upwardData,
        downward: downwardData,
        stable: stableData,
    };

    const chartData = {
        labels,
        datasets: [
            {
                data: dataMap[variant],
                borderColor: 'rgba(156, 163, 175, 0.5)',
                backgroundColor: 'rgba(156, 163, 175, 0.08)',
                fill: true,
                tension: 0.4,
                pointRadius: 2,
                pointBackgroundColor: 'rgba(156, 163, 175, 0.5)',
                borderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
        },
        scales: {
            x: {
                display: false,
            },
            y: {
                display: false,
            },
        },
        interaction: {
            intersect: false,
        },
    };

    return (
        <StyledChartCard>
            <StyledChartHeader>
                <div>
                    <StyledChartTitle>{title}</StyledChartTitle>
                    <StyledChartSubtitle>Last 7 days</StyledChartSubtitle>
                </div>
                <StyledChange>{change}</StyledChange>
            </StyledChartHeader>
            <Box sx={{ height: 80 }}>
                <Line data={chartData} options={chartOptions} />
            </Box>
        </StyledChartCard>
    );
};
