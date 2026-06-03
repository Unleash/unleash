import type { FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { styled, Typography } from '@mui/material';
import {
    MultimetricTotals,
    type MultimetricStep,
} from 'component/impact-metrics/MultimetricChart/MultimetricTotals';
import { MultimetricChart } from 'component/impact-metrics/MultimetricChart/MultimetricChart';
import type { ChartTimeRange } from 'component/impact-metrics/MultimetricChart/chartConfig';
import type {
    MultimetricStepSeries,
    MultimetricFeatureEvent,
} from 'component/impact-metrics/MultimetricChart/types';

export interface MultimetricChartCardProps {
    title: string;
    timeRange: ChartTimeRange;
    aggregationMode?: string;
    stepCount: number;
    stepSeries: MultimetricStepSeries[];
    stepTotals: MultimetricStep[];
    featureEvents?: MultimetricFeatureEvent[];
    start: string;
    end: string;
    loading?: boolean;
    href?: string;
    chartHeightSpacing?: { base: number; lg: number; sm: number };
    subtitle?: string;
    totalsHeaderSlot?: ReactNode;
    totalsLabel?: string;
    headerExtras?: ReactNode;
    totalsMiddleSlot?: ReactNode;
    expandTotalsColumn?: boolean;
}

const DEFAULT_CHART_HEIGHT_SPACING = { base: 34, lg: 28, sm: 24 } as const;

const cardBaseStyles = (theme: {
    shape: { borderRadiusMedium: number };
    palette: { divider: string; background: { paper: string } };
}) => ({
    borderRadius: theme.shape.borderRadiusMedium,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    textDecoration: 'none',
    color: 'inherit',
});

const StyledCardLink = styled(Link)(({ theme }) => ({
    ...cardBaseStyles(theme),
    display: 'block',
    cursor: 'pointer',
}));

const StyledCardDiv = styled('div')(({ theme }) => ({
    ...cardBaseStyles(theme),
}));

const StyledRoot = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',

    [theme.breakpoints.down('lg')]: {
        flexDirection: 'column',
    },
}));

const StyledChartColumn = styled('div', {
    shouldForwardProp: (prop) => prop !== 'expanded',
})<{ expanded: boolean }>(({ expanded }) => ({
    flex: expanded ? 5 : 2,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
}));

const StyledTotalsColumn = styled('div', {
    shouldForwardProp: (prop) => prop !== 'expanded',
})<{ expanded: boolean }>(({ theme, expanded }) => ({
    flex: expanded ? 3 : 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.elevation1,
    borderTopRightRadius: theme.shape.borderRadiusMedium,
    borderBottomRightRadius: theme.shape.borderRadiusMedium,
    [theme.breakpoints.down('lg')]: {
        borderTopRightRadius: 0,
        borderBottomLeftRadius: theme.shape.borderRadiusMedium,
    },
}));

const StyledChartHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(1.5, 3, 0, 3),
    minWidth: 0,
    [theme.breakpoints.down('lg')]: {
        padding: theme.spacing(1.5, 2, 0, 2),
    },
}));

const StyledTotalsHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'flex-end',
    padding: theme.spacing(3, 3, 0, 3),
    minWidth: 0,
    [theme.breakpoints.down('lg')]: {
        padding: theme.spacing(2.5, 2, 0, 2),
    },
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

const StyledChartPane = styled('div', {
    shouldForwardProp: (prop) => prop !== 'heightSpacing',
})<{ heightSpacing: { base: number; lg: number; sm: number } }>(
    ({ theme, heightSpacing }) => ({
        display: 'flex',
        minWidth: 0,
        flex: 1,
        minHeight: theme.spacing(heightSpacing.base),
        padding: theme.spacing(1.5, 3),
        '& > *': {
            minWidth: 0,
            flex: 1,
        },
        [theme.breakpoints.down('lg')]: {
            minHeight: theme.spacing(heightSpacing.lg),
            padding: theme.spacing(1.5, 2),
        },
        [theme.breakpoints.down('sm')]: {
            minHeight: theme.spacing(heightSpacing.sm),
        },
    }),
);

const StyledTotalsPane = styled('div')(({ theme }) => ({
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: theme.spacing(1.5, 3, 3, 3),
    [theme.breakpoints.down('lg')]: {
        padding: theme.spacing(1.5, 2, 2.5, 2),
    },
}));

const StyledTotalsSlot = styled('div')(({ theme }) => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(3, 3, 3, 3),
    borderBottom: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.down('lg')]: {
        padding: theme.spacing(2.5, 2, 2.5, 2),
    },
}));

const StyledTotalsMiddleSlot = styled('div')(({ theme }) => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2, 2.5, 1.25, 2.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.down('lg')]: {
        padding: theme.spacing(1.5, 2, 1, 2),
    },
}));

const timeRangeLabels: Record<ChartTimeRange, string> = {
    hour: 'Last hour',
    day: 'Last 24 hours',
    week: 'Last 7 days',
    month: 'Last 30 days',
};

const SUM_MODES = new Set(['count', 'sum']);

export const MultimetricChartCard: FC<MultimetricChartCardProps> = ({
    title,
    timeRange,
    aggregationMode,
    stepCount,
    stepSeries,
    stepTotals,
    featureEvents = [],
    start,
    end,
    loading,
    href,
    chartHeightSpacing = DEFAULT_CHART_HEIGHT_SPACING,
    subtitle,
    totalsHeaderSlot,
    totalsLabel: totalsLabelOverride,
    headerExtras,
    totalsMiddleSlot,
    expandTotalsColumn = false,
}) => {
    const timeLabel = timeRangeLabels[timeRange];
    const resolvedSubtitle =
        subtitle ?? `${stepCount} metrics \u00B7 ${timeLabel}`;
    const defaultTotalsLabel =
        aggregationMode && !SUM_MODES.has(aggregationMode)
            ? 'Last recorded value'
            : 'Totals';
    const totalsLabel = totalsLabelOverride ?? defaultTotalsLabel;

    const expanded = expandTotalsColumn && Boolean(totalsMiddleSlot);
    const content: ReactNode = (
        <StyledRoot>
            <StyledChartColumn expanded={expanded}>
                <StyledChartHeader>
                    <StyledTitle>{title}</StyledTitle>
                    <StyledSubtitle>{resolvedSubtitle}</StyledSubtitle>
                    {headerExtras}
                </StyledChartHeader>
                <StyledChartPane heightSpacing={chartHeightSpacing}>
                    <MultimetricChart
                        stepSeries={stepSeries}
                        timeRange={timeRange}
                        start={start}
                        end={end}
                        loading={loading}
                        featureEvents={featureEvents}
                    />
                </StyledChartPane>
            </StyledChartColumn>
            <StyledTotalsColumn expanded={expanded}>
                {totalsHeaderSlot ? (
                    <StyledTotalsSlot>{totalsHeaderSlot}</StyledTotalsSlot>
                ) : null}
                {totalsMiddleSlot ? (
                    <StyledTotalsMiddleSlot>
                        {totalsMiddleSlot}
                    </StyledTotalsMiddleSlot>
                ) : null}
                <StyledTotalsHeader>
                    <StyledTotalsLabel>{totalsLabel}</StyledTotalsLabel>
                </StyledTotalsHeader>
                <StyledTotalsPane>
                    <MultimetricTotals steps={stepTotals} />
                </StyledTotalsPane>
            </StyledTotalsColumn>
        </StyledRoot>
    );

    if (href) {
        return <StyledCardLink to={href}>{content}</StyledCardLink>;
    }
    return <StyledCardDiv>{content}</StyledCardDiv>;
};
