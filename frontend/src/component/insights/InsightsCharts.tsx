import type { FC } from 'react';
import { Box, Paper, styled } from '@mui/material';
import { LifecycleInsights } from './sections/LifecycleInsights.tsx';
import { PerformanceInsights } from './sections/PerformanceInsights.tsx';
import { UserInsights } from './sections/UserInsights.tsx';

const StyledContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(4),
}));

const StyledWidget = styled(Paper)(({ theme }) => ({
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
    boxShadow: 'none',
    display: 'flex',
    flexWrap: 'wrap',
    [theme.breakpoints.up('md')]: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
    },
}));

const StyledWidgetContent = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    width: '100%',
}));

const StyledWidgetStats = styled(Box)<{ width?: number; padding?: number }>(
    ({ theme, width = 300, padding = 3 }) => ({
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(2),
        padding: theme.spacing(padding),
        minWidth: '100%',
        [theme.breakpoints.up('md')]: {
            minWidth: `${width}px`,
            borderRight: `1px solid ${theme.palette.background.application}`,
        },
    }),
);

const StyledChartContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    minWidth: 0, // bugfix, see: https://github.com/chartjs/Chart.js/issues/4156#issuecomment-295180128
    flexGrow: 1,
    margin: 'auto 0',
    padding: theme.spacing(3),
}));

export const InsightsCharts: FC<{}> = () => {
    return (
        <StyledContainer>
            <LifecycleInsights />
            <PerformanceInsights />
            <UserInsights />
        </StyledContainer>
    );
};
