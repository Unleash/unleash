import type { FC } from 'react';
import { Box, Typography, styled, Paper } from '@mui/material';
import { PlausibleChart } from './PlausibleChart.tsx';

const StyledWidget = styled(Paper)(({ theme }) => ({
    borderRadius: `${theme.shape.borderRadiusMedium}px`,
    boxShadow: 'none',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
}));

const StyledChartContent = styled(Box)({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
});

const StyledImpactChartContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    minWidth: 0,
    flexGrow: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    margin: 'auto 0',
    padding: theme.spacing(3),
}));

const StyledHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'center',
    padding: theme.spacing(1.5, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledChartTitle = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    flexGrow: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
}));

export const PlausibleChartItem: FC = () => (
    <StyledWidget>
        <StyledHeader>
            <StyledChartTitle>
                <Typography variant='h6'>Plausible Analytics</Typography>
                <Typography variant='body2' color='text.secondary'>
                    Favorite events from Plausible analytics
                </Typography>
            </StyledChartTitle>
        </StyledHeader>

        <StyledChartContent>
            <StyledImpactChartContainer>
                <PlausibleChart
                    aspectRatio={1.5}
                    overrideOptions={{ maintainAspectRatio: false }}
                    emptyDataDescription='No Plausible analytics data available for favorite events.'
                />
            </StyledImpactChartContainer>
        </StyledChartContent>
    </StyledWidget>
);
