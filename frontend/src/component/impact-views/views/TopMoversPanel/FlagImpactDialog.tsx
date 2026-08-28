import { Suspense, useMemo, type FC } from 'react';
import {
    Box,
    Dialog,
    IconButton,
    styled,
    Typography,
    useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { format, formatDistanceToNow } from 'date-fns';
import {
    fillGradient,
    LineChart,
} from 'component/insights/components/LineChart/LineChart';
import { formatLargeNumbers } from 'component/impact-metrics/metricsFormatters';
import {
    EVENT_TYPE_LABEL,
    getEventColor,
} from 'component/impact-metrics/MultimetricChart/FeatureEventOverlay/eventTheme';
import { withAlpha } from 'component/impact-metrics/MultimetricChart/chartConfig';
import type { AggregationMode } from 'component/impact-metrics/types';
import type { FlagImpact, FlagImpactDetail } from '../computeFlagImpacts';
import { formatPercentage } from '../formatting';
import { formatHalfWindow } from './formatting';

const SUM_MODES: ReadonlySet<AggregationMode> = new Set(['count', 'sum']);

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.shape.borderRadiusLarge,
        overflow: 'hidden',
    },
}));

const StyledHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing(1.5),
    padding: theme.spacing(2.5, 3, 1.5, 3),
}));

const StyledHeaderLeft = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
    minWidth: 0,
}));

const StyledFlagRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    minWidth: 0,
}));

const StyledFlagName = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.h2.fontSize,
    fontWeight: 700,
    color: theme.palette.text.primary,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
}));

const StyledEventPill = styled(Box)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    padding: theme.spacing(0.25, 1),
    borderRadius: 999,
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: 600,
    flexShrink: 0,
}));

const StyledSubline = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
}));

const StyledBody = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1.5, 3, 3, 3),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const StyledDeltaPanel = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(2.5, 3),
    borderRadius: theme.shape.borderRadiusMedium,
    backgroundColor: theme.palette.background.elevation1,
}));

const StyledSidesRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'baseline',
    gap: theme.spacing(2.5),
    color: theme.palette.text.secondary,
}));

const StyledSide = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
});

const StyledSideLabel = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: 600,
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
}));

const StyledSideValue = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 600,
    color: theme.palette.text.primary,
    lineHeight: 1.2,
}));

const StyledArrow = styled(Box)(({ theme }) => ({
    color: theme.palette.text.disabled,
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 300,
    alignSelf: 'center',
    paddingBottom: theme.spacing(0.5),
}));

const StyledDeltaBlock = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'tone',
})<{ tone: FlagImpact['tone'] }>(({ theme, tone }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(0.25),
    color:
        tone === 'up'
            ? theme.palette.success.main
            : tone === 'down'
              ? theme.palette.error.main
              : theme.palette.text.secondary,
}));

const StyledDeltaValue = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.h1.fontSize,
    fontWeight: 700,
    lineHeight: 1.1,
    color: 'inherit',
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
}));

const StyledDeltaSecondary = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
}));

const StyledChartBox = styled(Box)({
    position: 'relative',
    width: '100%',
});

const formatAbs = (deltaAbs: number): string => {
    const sign = deltaAbs > 0 ? '+' : deltaAbs < 0 ? '−' : '';
    return `${sign}${formatLargeNumbers(Math.abs(deltaAbs))}`;
};

const buildMiniChartData = (
    detail: FlagImpactDetail,
    seriesColor: string,
    fillTopColor: string,
    fillBottomColor: string,
) => {
    const combined: [number, number][] = [
        ...detail.preSeries,
        ...detail.postSeries,
    ].sort(([leftTs], [rightTs]) => leftTs - rightTs);
    return {
        labels: combined.map(([tsSec]) => new Date(tsSec * 1000)),
        datasets: [
            {
                label: 'Goal',
                data: combined.map(([, value]) => value),
                borderColor: seriesColor,
                backgroundColor: fillGradient(fillBottomColor, fillTopColor),
                fill: true,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4,
                tension: 0.2,
                spanGaps: true,
            },
        ],
    };
};

const buildMiniChartOptions = (
    detail: FlagImpactDetail,
    eventLineColor: string,
    preTintColor: string,
) => {
    const eventMs = detail.event.timestamp;
    const halfWindowMs = detail.halfWindowMs;
    return {
        responsive: true,
        interaction: { mode: 'index' as const, intersect: false },
        layout: { padding: { top: 12, right: 8, left: 8, bottom: 4 } },
        scales: {
            x: {
                type: 'time' as const,
                min: eventMs - halfWindowMs,
                max: eventMs + halfWindowMs,
                ticks: {
                    maxRotation: 0,
                    maxTicksLimit: 5,
                    font: { size: 10 },
                },
                grid: { display: false },
            },
            y: {
                beginAtZero: false,
                ticks: {
                    maxTicksLimit: 4,
                    font: { size: 10 },
                    callback: (value: unknown): string | number =>
                        typeof value === 'number'
                            ? formatLargeNumbers(value)
                            : (value as number),
                },
            },
        },
        plugins: {
            legend: { display: false },
            annotation: {
                annotations: {
                    'pre-tint': {
                        type: 'box' as const,
                        xMin: eventMs - halfWindowMs,
                        xMax: eventMs,
                        backgroundColor: preTintColor,
                        borderWidth: 0,
                        drawTime: 'beforeDatasetsDraw' as const,
                    },
                    'event-line': {
                        type: 'line' as const,
                        xMin: eventMs,
                        xMax: eventMs,
                        borderColor: eventLineColor,
                        borderWidth: 2,
                        borderDash: [4, 3],
                    },
                },
            },
        },
        animations: {
            x: { duration: 0 },
            y: { duration: 0 },
        },
    };
};

export type FlagImpactDialogProps = {
    impact: FlagImpact | null;
    aggregationMode: AggregationMode;
    onClose: () => void;
};

export const FlagImpactDialog: FC<FlagImpactDialogProps> = ({
    impact,
    aggregationMode,
    onClose,
}) => {
    const theme = useTheme();

    const open = impact !== null;
    const isSumMode = SUM_MODES.has(aggregationMode);

    const eventColor = impact
        ? getEventColor(theme, impact.detail.event.type)
        : theme.palette.text.secondary;

    const chartData = useMemo(
        () =>
            impact
                ? buildMiniChartData(
                      impact.detail,
                      theme.palette.primary.main,
                      withAlpha(theme.palette.primary.main, 0),
                      withAlpha(theme.palette.primary.main, 0.18),
                  )
                : null,
        [impact, theme.palette.primary.main],
    );

    const chartOptions = useMemo(
        () =>
            impact
                ? buildMiniChartOptions(
                      impact.detail,
                      theme.palette.primary.main,
                      withAlpha(theme.palette.text.primary, 0.04),
                  )
                : null,
        [impact, theme.palette.primary.main, theme.palette.text.primary],
    );

    if (!impact) {
        return (
            <StyledDialog
                open={open}
                onClose={onClose}
                maxWidth='sm'
                fullWidth
            />
        );
    }

    const { detail, tone, deltaPct } = impact;
    const { event } = detail;

    const TrendIcon =
        tone === 'up'
            ? TrendingUpIcon
            : tone === 'down'
              ? TrendingDownIcon
              : TrendingFlatIcon;

    const happenedAt = formatDistanceToNow(new Date(event.timestamp), {
        addSuffix: true,
    });
    const absoluteTimestamp = format(
        new Date(event.timestamp),
        "MMM d 'at' HH:mm",
    );

    const windowLabel = `±${formatHalfWindow(detail.halfWindowMs)} around the flip`;
    const sideCaption = isSumMode
        ? `Sum of the goal · ${windowLabel}`
        : `Average of the goal · ${windowLabel}`;

    return (
        <StyledDialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
            <StyledHeader>
                <StyledHeaderLeft>
                    <StyledFlagRow>
                        <StyledFlagName title={event.featureName}>
                            {event.featureName}
                        </StyledFlagName>
                        <StyledEventPill
                            sx={{
                                backgroundColor: withAlpha(eventColor, 0.14),
                                color: eventColor,
                                border: `1px solid ${eventColor}`,
                            }}
                        >
                            <PowerSettingsNewIcon
                                sx={{ fontSize: 12, color: 'inherit' }}
                            />
                            {EVENT_TYPE_LABEL[event.type]}
                        </StyledEventPill>
                    </StyledFlagRow>
                    <StyledSubline title={absoluteTimestamp}>
                        Flipped {happenedAt}
                        {event.createdBy ? ` by ${event.createdBy}` : ''}
                    </StyledSubline>
                </StyledHeaderLeft>
                <IconButton aria-label='Close' size='small' onClick={onClose}>
                    <CloseIcon fontSize='small' />
                </IconButton>
            </StyledHeader>
            <StyledBody>
                <StyledDeltaPanel>
                    <StyledSidesRow>
                        <StyledSide>
                            <StyledSideLabel>Before</StyledSideLabel>
                            <StyledSideValue>
                                {formatLargeNumbers(detail.before)}
                            </StyledSideValue>
                        </StyledSide>
                        <StyledArrow>{'→'}</StyledArrow>
                        <StyledSide>
                            <StyledSideLabel>After</StyledSideLabel>
                            <StyledSideValue>
                                {formatLargeNumbers(detail.after)}
                            </StyledSideValue>
                        </StyledSide>
                    </StyledSidesRow>
                    <StyledDeltaBlock tone={tone}>
                        <StyledDeltaValue>
                            <TrendIcon sx={{ fontSize: 28 }} />
                            {formatPercentage(deltaPct)}
                        </StyledDeltaValue>
                        <StyledDeltaSecondary>
                            {`${formatAbs(detail.deltaAbs)} · ${sideCaption}`}
                        </StyledDeltaSecondary>
                    </StyledDeltaBlock>
                </StyledDeltaPanel>
                <StyledChartBox>
                    {chartData && chartOptions ? (
                        <Suspense fallback={null}>
                            <LineChart
                                data={chartData}
                                overrideOptions={chartOptions}
                                aspectRatio={3}
                            />
                        </Suspense>
                    ) : null}
                </StyledChartBox>
            </StyledBody>
        </StyledDialog>
    );
};
