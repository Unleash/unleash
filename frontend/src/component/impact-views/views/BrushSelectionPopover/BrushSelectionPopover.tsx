import { useId, type FC } from 'react';
import {
    Box,
    IconButton,
    Popper,
    styled,
    Typography,
    useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { format } from 'date-fns';
import { formatLargeNumbers } from 'component/impact-metrics/metricsFormatters';
import type { TimeWindow } from 'component/impact-metrics/MultimetricChart/types';
import {
    EVENT_TYPE_LABEL,
    getEventColor,
} from 'component/impact-metrics/MultimetricChart/FeatureEventOverlay/eventTheme';
import {
    buildSparklinePaths,
    SPARKLINE_HEIGHT,
    SPARKLINE_WIDTH,
} from '../GoalSummaryPanel/sparkline';
import { formatPercentage } from '../formatting';
import type { FlagImpact } from '../computeFlagImpacts';
import type { WindowSummary } from '../computeWindowSummary';

type Tone = 'up' | 'down' | 'flat';

const SMALL_CHANGE_THRESHOLD_PCT = 1;

const toneOf = (deltaPct: number | null): Tone => {
    if (deltaPct === null || Math.abs(deltaPct) < SMALL_CHANGE_THRESHOLD_PCT) {
        return 'flat';
    }
    return deltaPct > 0 ? 'up' : 'down';
};

const StyledPaper = styled(Box)(({ theme }) => ({
    width: 460,
    maxWidth: '92vw',
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
    boxShadow: theme.shadows[8],
    overflow: 'hidden',
}));

const StyledHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
    padding: theme.spacing(2, 1.5, 2, 3),
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledRange = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.primary,
}));

const StyledBody = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
}));

const StyledGoalRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
}));

const StyledGoalValue = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 700,
    color: theme.palette.text.primary,
    lineHeight: 1.1,
}));

const StyledDelta = styled('span', {
    shouldForwardProp: (prop) => prop !== 'tone',
})<{ tone: Tone }>(({ theme, tone }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    fontSize: theme.typography.body2.fontSize,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    color:
        tone === 'up'
            ? theme.palette.success.main
            : tone === 'down'
              ? theme.palette.error.main
              : theme.palette.text.secondary,
}));

const StyledCaption = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
}));

const StyledSparklineBox = styled(Box)(({ theme }) => ({
    width: '100%',
    height: SPARKLINE_HEIGHT,
    color: theme.palette.primary.main,
}));

const StyledSparkline = styled('svg')({
    width: '100%',
    height: '100%',
    display: 'block',
});

const StyledList = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.25),
    maxHeight: 168,
    overflowY: 'auto',
}));

const StyledRow = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto auto',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(0.75, 1),
    marginInline: theme.spacing(-1),
    borderRadius: theme.shape.borderRadius,
    cursor: 'default',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

const StyledRowDelta = styled('span', {
    shouldForwardProp: (prop) => prop !== 'tone',
})<{ tone: Tone }>(({ theme, tone }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    fontSize: theme.typography.body2.fontSize,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    color:
        tone === 'up'
            ? theme.palette.success.main
            : tone === 'down'
              ? theme.palette.error.main
              : theme.palette.text.secondary,
}));

const StyledDot = styled('span', {
    shouldForwardProp: (prop) => prop !== 'color',
})<{ color: string }>(({ color }) => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: color,
    flexShrink: 0,
}));

const StyledFlagName = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    fontWeight: 500,
    color: theme.palette.text.primary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
}));

const StyledRowMeta = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
}));

const StyledEmpty = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
}));

export type BrushSelectionPopoverProps = {
    anchorEl: HTMLElement | null;
    open: boolean;
    selection: TimeWindow;
    summary: WindowSummary;
    // Per-flip impacts for the flags that changed in the window (all flags,
    // incl. unfollowed), already ranked by |Δ%| descending.
    impacts: FlagImpact[];
    onClear: () => void;
    // Hovering a flip row highlights it on the chart line (null on leave).
    onHoverFlip?: (timestampMs: number | null) => void;
};

export const BrushSelectionPopover: FC<BrushSelectionPopoverProps> = ({
    anchorEl,
    open,
    selection,
    summary,
    impacts,
    onClear,
    onHoverFlip,
}) => {
    const theme = useTheme();
    const gradientId = useId();
    const { goalSummary, windowedSeries } = summary;
    const tone = toneOf(goalSummary.deltaPct);
    const sparkline = buildSparklinePaths(windowedSeries);

    const TrendIcon =
        tone === 'up'
            ? TrendingUpIcon
            : tone === 'down'
              ? TrendingDownIcon
              : TrendingFlatIcon;

    const rangeLabel = `${format(selection.fromMs, 'MMM d, HH:mm')} – ${format(
        selection.toMs,
        'HH:mm',
    )}`;

    return (
        <Popper
            open={open && anchorEl !== null}
            anchorEl={anchorEl}
            placement='top'
            modifiers={[
                { name: 'offset', options: { offset: [0, 10] } },
                { name: 'flip', enabled: true },
                {
                    name: 'preventOverflow',
                    options: { padding: 8 },
                },
            ]}
            style={{ zIndex: theme.zIndex.tooltip }}
        >
            <StyledPaper>
                <StyledHeader>
                    <StyledRange>{rangeLabel}</StyledRange>
                    <IconButton
                        size='small'
                        aria-label='Clear selection'
                        onClick={onClear}
                    >
                        <CloseIcon fontSize='small' />
                    </IconButton>
                </StyledHeader>
                <StyledBody>
                    <Box>
                        <StyledCaption>Goal in window</StyledCaption>
                        <StyledGoalRow>
                            <StyledGoalValue>
                                {formatLargeNumbers(goalSummary.current)}
                            </StyledGoalValue>
                            {goalSummary.deltaPct !== null ? (
                                <StyledDelta tone={tone}>
                                    <TrendIcon sx={{ fontSize: 16 }} />
                                    {formatPercentage(goalSummary.deltaPct)}
                                </StyledDelta>
                            ) : null}
                        </StyledGoalRow>
                    </Box>

                    {sparkline ? (
                        <StyledSparklineBox>
                            <StyledSparkline
                                viewBox={`0 0 ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT}`}
                                preserveAspectRatio='none'
                                role='img'
                                aria-label='Goal trend in selected window'
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
                                            stopColor='currentColor'
                                            stopOpacity={0.3}
                                        />
                                        <stop
                                            offset='100%'
                                            stopColor='currentColor'
                                            stopOpacity={0}
                                        />
                                    </linearGradient>
                                </defs>
                                <path
                                    d={sparkline.area}
                                    fill={`url(#${gradientId})`}
                                    stroke='none'
                                />
                                <path
                                    d={sparkline.line}
                                    fill='none'
                                    stroke='currentColor'
                                    strokeWidth={1.5}
                                    strokeLinejoin='round'
                                    strokeLinecap='round'
                                    vectorEffect='non-scaling-stroke'
                                />
                            </StyledSparkline>
                        </StyledSparklineBox>
                    ) : null}

                    <Box>
                        <StyledCaption>
                            Flag changes ({impacts.length})
                        </StyledCaption>
                        {impacts.length === 0 ? (
                            <StyledEmpty>
                                No measurable flag changes in this window.
                            </StyledEmpty>
                        ) : (
                            <StyledList>
                                {impacts.map((impact) => {
                                    const { event } = impact.detail;
                                    return (
                                        <StyledRow
                                            key={event.id}
                                            onMouseEnter={() =>
                                                onHoverFlip?.(event.timestamp)
                                            }
                                            onMouseLeave={() =>
                                                onHoverFlip?.(null)
                                            }
                                        >
                                            <StyledDot
                                                color={getEventColor(
                                                    theme,
                                                    event.type,
                                                )}
                                            />
                                            <StyledFlagName
                                                title={event.featureName}
                                            >
                                                {event.featureName}
                                            </StyledFlagName>
                                            <StyledRowMeta>
                                                {EVENT_TYPE_LABEL[event.type]} ·{' '}
                                                {format(
                                                    event.timestamp,
                                                    'HH:mm',
                                                )}
                                            </StyledRowMeta>
                                            <StyledRowDelta tone={impact.tone}>
                                                {formatPercentage(
                                                    impact.deltaPct,
                                                )}
                                            </StyledRowDelta>
                                        </StyledRow>
                                    );
                                })}
                            </StyledList>
                        )}
                    </Box>
                </StyledBody>
            </StyledPaper>
        </Popper>
    );
};
