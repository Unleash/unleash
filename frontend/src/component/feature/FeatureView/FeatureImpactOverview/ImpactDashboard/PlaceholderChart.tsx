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
    padding: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadiusMedium,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: 'none',
    backgroundColor: theme.palette.background.paper,
}));

const StyledChartHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
}));

const StyledChartTitle = styled(Typography)(({ theme }) => ({
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.text.disabled,
    fontSize: theme.fontSizes.smallBody,
}));

const StyledChange = styled(Typography)(({ theme }) => ({
    fontWeight: 600,
    color: theme.palette.text.disabled,
    fontSize: theme.fontSizes.smallBody,
}));

// Static data for the placeholder - gentle upward trend
const labels = ['', '', '', '', '', '', ''];
const data = [2.8, 3.0, 2.9, 3.2, 3.4, 3.6, 3.8];

export const PlaceholderChart: FC = () => {
    const chartData = {
        labels,
        datasets: [
            {
                data,
                borderColor: 'rgba(156, 163, 175, 0.5)',
                backgroundColor: 'rgba(156, 163, 175, 0.08)',
                fill: true,
                tension: 0.4,
                pointRadius: 0,
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
                <StyledChartTitle>Conversion Rate</StyledChartTitle>
                <StyledChange>+12.4%</StyledChange>
            </StyledChartHeader>
            <Box sx={{ height: 80 }}>
                <Line data={chartData} options={chartOptions} />
            </Box>
        </StyledChartCard>
    );
};
