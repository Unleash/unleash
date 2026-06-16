import { useState, type FC } from 'react';
import { Box, styled, Tooltip, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import type { ChartTimeRange } from 'component/impact-metrics/MultimetricChart/chartConfig';
import type { AggregationMode } from 'component/impact-metrics/types';
import {
    HALF_WINDOW_MS_BY_TIME_RANGE,
    type FlagImpact,
    type FlagImpactTone,
} from '../computeFlagImpacts';
import { formatPercentage } from '../formatting';
import { formatHalfWindow } from './formatting';
import { FlagImpactDialog } from './FlagImpactDialog';

const MAX_VISIBLE = 4;

const TONE_ICONS = {
    up: TrendingUpIcon,
    down: TrendingDownIcon,
    flat: TrendingFlatIcon,
} as const;

const StyledRoot = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.75),
    flex: 1,
}));

const StyledHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
}));

const StyledLabel = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
}));

const StyledWindowCaption = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    fontWeight: 600,
    color: theme.palette.text.secondary,
    cursor: 'default',
}));

const StyledList = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.25),
}));

const StyledRow = styled('button')(({ theme }) => ({
    // Reset native button chrome so the row reads as a list item, not a button.
    border: 'none',
    background: 'none',
    font: 'inherit',
    color: 'inherit',
    width: '100%',
    textAlign: 'left',
    cursor: 'pointer',
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    alignItems: 'center',
    gap: theme.spacing(1),
    // No horizontal padding: the row's content aligns flush with the panel's
    // header label and window caption so the rail sections read as a column.
    padding: theme.spacing(0.5, 0),
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:focus-visible': {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: -2,
    },
}));

const StyledFlagName = styled(Box)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    fontWeight: 500,
    color: theme.palette.text.primary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
}));

const StyledDelta = styled('span', {
    shouldForwardProp: (prop) => prop !== 'tone',
})<{ tone: FlagImpactTone }>(({ theme, tone }) => ({
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

const StyledOverflow = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
    textAlign: 'right',
    paddingRight: theme.spacing(0.75),
}));

const StyledEmpty = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    minHeight: theme.spacing(8),
}));

export type TopMoversPanelProps = {
    impacts: FlagImpact[];
    timeRange: ChartTimeRange;
    aggregationMode: AggregationMode;
};

export const TopMoversPanel: FC<TopMoversPanelProps> = ({
    impacts,
    timeRange,
    aggregationMode,
}) => {
    const [openImpact, setOpenImpact] = useState<FlagImpact | null>(null);
    const visible = impacts.slice(0, MAX_VISIBLE);
    const overflowCount = impacts.length - visible.length;
    const windowLabel = `±${formatHalfWindow(
        HALF_WINDOW_MS_BY_TIME_RANGE[timeRange],
    )}`;

    return (
        <StyledRoot>
            <StyledHeader>
                <StyledLabel>Top movers</StyledLabel>
                <Tooltip
                    arrow
                    placement='top'
                    title={`Goal change in the ${windowLabel} window before vs. after each flag's most significant change`}
                >
                    <StyledWindowCaption>{windowLabel}</StyledWindowCaption>
                </Tooltip>
            </StyledHeader>
            {visible.length === 0 ? (
                <StyledEmpty>
                    No measurable flag changes in this window.
                </StyledEmpty>
            ) : (
                <StyledList>
                    {visible.map((impact) => {
                        const TrendIcon = TONE_ICONS[impact.tone];
                        return (
                            <StyledRow
                                key={impact.featureName}
                                type='button'
                                onClick={() => setOpenImpact(impact)}
                                aria-label={`${impact.featureName} ${formatPercentage(impact.deltaPct)}, view impact details`}
                            >
                                <StyledFlagName title={impact.featureName}>
                                    {impact.featureName}
                                </StyledFlagName>
                                <StyledDelta tone={impact.tone}>
                                    <TrendIcon sx={{ fontSize: 14 }} />
                                    {formatPercentage(impact.deltaPct)}
                                </StyledDelta>
                            </StyledRow>
                        );
                    })}
                    {overflowCount > 0 ? (
                        <StyledOverflow>+{overflowCount} more</StyledOverflow>
                    ) : null}
                </StyledList>
            )}
            <FlagImpactDialog
                impact={openImpact}
                aggregationMode={aggregationMode}
                onClose={() => setOpenImpact(null)}
            />
        </StyledRoot>
    );
};
