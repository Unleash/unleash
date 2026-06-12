import type { FC, ReactNode } from 'react';
import { Box, styled, Typography } from '@mui/material';
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
    subtitle: string;
    timeRange: ChartTimeRange;
    aggregationMode?: string;
    stepSeries: MultimetricStepSeries[];
    stepTotals: MultimetricStep[];
    featureEvents: MultimetricFeatureEvent[];
    start: string;
    end: string;
    loading: boolean;
    chartHeightSpacing: { base: number; lg: number; sm: number };
    totalsHeaderSlot: ReactNode;
    totalsLabel?: string;
}

const StyledCard = styled(Box)(({ theme }) => ({
    borderRadius: theme.shape.borderRadiusMedium,
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    color: 'inherit',
}));

const StyledRoot = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',

    [theme.breakpoints.down('lg')]: {
        flexDirection: 'column',
    },
}));

const StyledChartColumn = styled(Box)({
    flex: 2,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
});

const StyledTotalsColumn = styled(Box)(({ theme }) => ({
    flex: 1,
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

const StyledChartHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(1.5, 3, 0, 3),
    minWidth: 0,
    [theme.breakpoints.down('lg')]: {
        padding: theme.spacing(1.5, 2, 0, 2),
    },
}));

const StyledTotalsHeader = styled(Box)(({ theme }) => ({
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

const StyledChartPane = styled(Box, {
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

const StyledTotalsPane = styled(Box)(({ theme }) => ({
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

const StyledTotalsSlot = styled(Box)(({ theme }) => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(3, 3, 3, 3),
    borderBottom: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.down('lg')]: {
        padding: theme.spacing(2.5, 2, 2.5, 2),
    },
}));

const SUM_MODES = new Set(['count', 'sum']);

export const MultimetricChartCard: FC<MultimetricChartCardProps> = ({
    title,
    subtitle,
    timeRange,
    aggregationMode,
    stepSeries,
    stepTotals,
    featureEvents,
    start,
    end,
    loading,
    chartHeightSpacing,
    totalsHeaderSlot,
    totalsLabel: totalsLabelOverride,
}) => {
    const defaultTotalsLabel =
        aggregationMode && !SUM_MODES.has(aggregationMode)
            ? 'Last recorded value'
            : 'Totals';
    const totalsLabel = totalsLabelOverride ?? defaultTotalsLabel;

    return (
        <StyledCard>
            <StyledRoot>
                <StyledChartColumn>
                    <StyledChartHeader>
                        <StyledTitle>{title}</StyledTitle>
                        <StyledSubtitle>{subtitle}</StyledSubtitle>
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
                <StyledTotalsColumn>
                    <StyledTotalsSlot>{totalsHeaderSlot}</StyledTotalsSlot>
                    <StyledTotalsHeader>
                        <StyledTotalsLabel>{totalsLabel}</StyledTotalsLabel>
                    </StyledTotalsHeader>
                    <StyledTotalsPane>
                        <MultimetricTotals steps={stepTotals} />
                    </StyledTotalsPane>
                </StyledTotalsColumn>
            </StyledRoot>
        </StyledCard>
    );
};
