import type { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { styled, Typography } from '@mui/material';
import {
    MultimetricTotals,
    STEP_COLORS,
    type MultimetricStep,
} from 'component/impact-metrics/MultimetricChart/MultimetricTotals';
import { MultimetricChart } from 'component/impact-metrics/MultimetricChart/MultimetricChart';
import type {
    MultimetricStepSeries,
    MultimetricFeatureEvent,
} from 'component/impact-metrics/MultimetricChart/types';

export type { MultimetricStep, MultimetricStepSeries, MultimetricFeatureEvent };

export interface MultimetricChartCardProps {
    title: string;
    timeRange: 'hour' | 'day' | 'week' | 'month';
    stepCount: number;
    stepSeries: MultimetricStepSeries[];
    stepTotals: MultimetricStep[];
    featureEvents?: MultimetricFeatureEvent[];
    start?: string;
    end?: string;
    loading?: boolean;
    href?: string;
}

const cardBaseStyles = (theme: {
    shape: { borderRadiusMedium: number };
    palette: { divider: string; background: { paper: string } };
}) => ({
    borderRadius: theme.shape.borderRadiusMedium,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'column' as const,
    minWidth: 0,
    textDecoration: 'none',
    color: 'inherit',
    gridColumn: '1 / -1',
});

const StyledCardLink = styled(Link)(({ theme }) => ({
    ...cardBaseStyles(theme),
    cursor: 'pointer',
}));

const StyledCardDiv = styled('div')(({ theme }) => ({
    ...cardBaseStyles(theme),
}));

const StyledHeader = styled('div')({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
});

const StyledChartHeader = styled('div')(({ theme }) => ({
    flex: 2,
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(1.5, 3, 0, 3),
    minWidth: 0,
}));

const StyledTotalsHeader = styled('div')(({ theme }) => ({
    flex: 1,
    display: 'flex',
    alignItems: 'flex-end',
    padding: theme.spacing(1.5, 3, 0, 3),
    minWidth: 0,
    backgroundColor: theme.palette.background.elevation1,
    borderTopRightRadius: theme.shape.borderRadiusMedium,
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.primary,
}));

const StyledSubtitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
}));

const StyledTotalsLabel = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
}));

const StyledBody = styled('div')({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
});

const StyledChartPane = styled('div')(({ theme }) => ({
    flex: 2,
    minWidth: 0,
    display: 'flex',
    height: theme.spacing(34),
    padding: theme.spacing(1.5, 3),
}));

const StyledTotalsPane = styled('div')(({ theme }) => ({
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: theme.spacing(1.5, 3),
    backgroundColor: theme.palette.background.elevation1,
    borderBottomRightRadius: theme.shape.borderRadiusMedium,
}));

const timeRangeLabels: Record<string, string> = {
    hour: 'Last hour',
    day: 'Last 24 hours',
    week: 'Last 7 days',
    month: 'Last 30 days',
};

export const MultimetricChartCard: FC<MultimetricChartCardProps> = ({
    title,
    timeRange,
    stepCount,
    stepSeries,
    stepTotals,
    featureEvents = [],
    start,
    end,
    loading,
    href,
}) => {
    const timeLabel = timeRangeLabels[timeRange] ?? timeRange;

    const content: ReactNode = (
        <>
            <StyledHeader>
                <StyledChartHeader>
                    <StyledTitle>{title}</StyledTitle>
                    <StyledSubtitle>
                        {stepCount} metrics &middot; {timeLabel}
                    </StyledSubtitle>
                </StyledChartHeader>
                <StyledTotalsHeader>
                    <StyledTotalsLabel>Totals</StyledTotalsLabel>
                </StyledTotalsHeader>
            </StyledHeader>
            <StyledBody>
                <StyledChartPane>
                    <MultimetricChart
                        stepSeries={stepSeries}
                        timeRange={timeRange}
                        start={start}
                        end={end}
                        loading={loading}
                        colors={STEP_COLORS}
                        featureEvents={featureEvents}
                    />
                </StyledChartPane>
                <StyledTotalsPane>
                    <MultimetricTotals steps={stepTotals} compact />
                </StyledTotalsPane>
            </StyledBody>
        </>
    );

    if (href) {
        return <StyledCardLink to={href}>{content}</StyledCardLink>;
    }
    return <StyledCardDiv>{content}</StyledCardDiv>;
};
