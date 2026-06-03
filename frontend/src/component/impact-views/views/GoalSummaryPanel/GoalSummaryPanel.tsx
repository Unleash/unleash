import { useId, type FC } from 'react';
import { Box, styled, Typography, useTheme } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import { formatLargeNumbers } from 'component/impact-metrics/metricsFormatters';
import type { MultimetricStepSeries } from 'component/impact-metrics/MultimetricChart/types';
import type { GoalSummary } from '../computeGoalSummary';
import {
    buildSparklinePaths,
    SPARKLINE_HEIGHT,
    SPARKLINE_WIDTH,
} from './sparkline';

const StyledRoot = styled(Box)(({ theme }) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'center',
    gap: theme.spacing(0.5),
    margin: theme.spacing(-3, -3, -3, -3),
    padding: theme.spacing(4, 3, 4, 3),
    borderTopRightRadius: theme.shape.borderRadiusMedium,
    background:
        theme.mode === 'dark'
            ? `linear-gradient(135deg, ${theme.palette.background.alternative} 0%, ${theme.palette.action.alternative} 100%)`
            : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    color: theme.palette.common.white,
    overflow: 'hidden',
    [theme.breakpoints.down('lg')]: {
        margin: theme.spacing(-2.5, -2, -2.5, -2),
        padding: theme.spacing(3.5, 2, 3.5, 2),
        borderTopRightRadius: 0,
    },
}));

const StyledBody = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(140px, 0.6fr)',
    gap: theme.spacing(2.5),
    alignItems: 'stretch',
    [theme.breakpoints.down('md')]: {
        gridTemplateColumns: '1fr',
        gap: theme.spacing(1.5),
        alignItems: 'center',
    },
}));

const StyledSummary = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    minWidth: 0,
}));

const StyledSparklineBox = styled(Box)(({ theme }) => ({
    width: '100%',
    minHeight: SPARKLINE_HEIGHT,
    display: 'flex',
    alignItems: 'stretch',
    [theme.breakpoints.down('md')]: {
        height: SPARKLINE_HEIGHT * 0.7,
        minHeight: 'unset',
    },
}));

const StyledLabelRow = styled(Box)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    color: theme.palette.common.white,
}));

const StyledLabel = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.common.white,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
}));

const StyledMetricName = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.common.white,
    lineHeight: 1.3,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    overflowWrap: 'anywhere',
}));

const StyledValueRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'baseline',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1.5),
}));

const StyledValue = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.h2.fontSize,
    fontWeight: 700,
    color: theme.palette.common.white,
    lineHeight: 1,
}));

const StyledDeltaRow = styled(Box)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    fontSize: theme.fontSizes.smallBody,
}));

const StyledCaption = styled(Typography)(() => ({
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: '0.75rem',
}));

const StyledSparkline = styled('svg')({
    width: '100%',
    height: '100%',
    display: 'block',
});

type Trend = 'up' | 'down' | 'flat';

const trendOf = (deltaAbs: number | null): Trend => {
    if (deltaAbs === null || deltaAbs === 0) return 'flat';
    if (deltaAbs > 0) return 'up';
    return 'down';
};

const formatPct = (pct: number): string => {
    const sign = pct > 0 ? '+' : '';
    const formatted = Number.isInteger(pct) ? `${pct}` : pct.toFixed(1);
    return `${sign}${formatted}%`;
};

const formatAbsoluteDelta = (deltaAbs: number): string => {
    const sign = deltaAbs > 0 ? '+' : deltaAbs < 0 ? '\u2212' : '';
    return `${sign}${formatLargeNumbers(Math.abs(deltaAbs))}`;
};

export type GoalSummaryPanelProps = {
    goalMetricLabel: string;
    summary: GoalSummary;
    series: MultimetricStepSeries | undefined;
    timeLabel: string;
};

export const GoalSummaryPanel: FC<GoalSummaryPanelProps> = ({
    goalMetricLabel,
    summary,
    series,
    timeLabel,
}) => {
    const theme = useTheme();
    const gradientId = useId();
    const trend = trendOf(summary.deltaAbs);
    const sparklinePaths = series ? buildSparklinePaths(series) : null;
    const showDelta =
        summary.mode === 'latest' &&
        summary.deltaAbs !== null &&
        summary.deltaAbs !== 0;

    const trendColor = theme.palette.common.white;
    const sparklineColor = theme.palette.common.white;

    const TrendIcon =
        trend === 'up'
            ? TrendingUpIcon
            : trend === 'down'
              ? TrendingDownIcon
              : TrendingFlatIcon;

    const caption =
        summary.mode === 'cumulative'
            ? `Total over ${timeLabel.toLowerCase()}`
            : `vs. start of ${timeLabel.toLowerCase()}`;

    return (
        <StyledRoot>
            <StyledLabelRow>
                <FlagOutlinedIcon sx={{ fontSize: 16 }} />
                <StyledLabel>Goal</StyledLabel>
            </StyledLabelRow>
            <StyledBody>
                <StyledSummary>
                    <StyledMetricName title={goalMetricLabel}>
                        {goalMetricLabel}
                    </StyledMetricName>
                    <StyledValueRow>
                        <StyledValue>
                            {formatLargeNumbers(summary.current)}
                        </StyledValue>
                        {showDelta && summary.deltaAbs !== null ? (
                            <StyledDeltaRow sx={{ color: trendColor }}>
                                <TrendIcon sx={{ fontSize: 16 }} />
                                <Typography
                                    component='span'
                                    sx={{
                                        fontSize: 'inherit',
                                        fontWeight: 600,
                                        color: 'inherit',
                                    }}
                                >
                                    {summary.deltaPct === null
                                        ? formatAbsoluteDelta(summary.deltaAbs)
                                        : `${formatPct(summary.deltaPct)} (${formatAbsoluteDelta(summary.deltaAbs)})`}
                                </Typography>
                            </StyledDeltaRow>
                        ) : null}
                    </StyledValueRow>
                    <StyledCaption variant='caption'>{caption}</StyledCaption>
                </StyledSummary>
                {sparklinePaths ? (
                    <StyledSparklineBox>
                        <StyledSparkline
                            viewBox={`0 0 ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT}`}
                            preserveAspectRatio='none'
                            role='img'
                            aria-label={`${goalMetricLabel} trend sparkline`}
                        >
                            <defs>
                                <linearGradient
                                    id={gradientId}
                                    x1='0'
                                    y1='0'
                                    x2='0'
                                    y2='1'
                                >
                                    <stop
                                        offset='0%'
                                        stopColor={sparklineColor}
                                        stopOpacity={0.35}
                                    />
                                    <stop
                                        offset='100%'
                                        stopColor={sparklineColor}
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>
                            <path
                                d={sparklinePaths.area}
                                fill={`url(#${gradientId})`}
                                stroke='none'
                            />
                            <path
                                d={sparklinePaths.line}
                                fill='none'
                                stroke={sparklineColor}
                                strokeWidth={1.5}
                                strokeLinejoin='round'
                                strokeLinecap='round'
                                vectorEffect='non-scaling-stroke'
                            />
                        </StyledSparkline>
                    </StyledSparklineBox>
                ) : null}
            </StyledBody>
        </StyledRoot>
    );
};
