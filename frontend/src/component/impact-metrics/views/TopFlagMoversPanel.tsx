import { useMemo, type FC } from 'react';
import {
    Box,
    MenuItem,
    Select,
    styled,
    Tooltip,
    Typography,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { withAlpha } from 'component/impact-metrics/MultimetricChart/chartConfig';
import { getEventColor } from 'component/impact-metrics/MultimetricChart/FeatureEventOverlay/eventTheme';
import { useTheme } from '@mui/material/styles';
import type { FlagEventImpact } from './computeFlagEventImpact';
import {
    BASELINE_OPTIONS,
    type BaselineOptionId,
} from './computeFlagEventImpact';

import {
    SMALL_CHANGE_THRESHOLD_PCT,
    formatPct,
    toneOf,
} from './flagImpactFormatting';

const MAX_VISIBLE = 4;

const StyledRoot = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.75),
    // Fill the slot vertically so all three rail sections (goal, top movers,
    // signals) divide the available height proportionally and look balanced.
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

// `standard` variant — underline-only, no border box. Matches the borderless
// rhythm of the surrounding rail (uppercase header, dotted Signals legend)
// so the picker reads as part of the section rather than a heavy form input.
const StyledBaselineSelect = styled(Select)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.primary,
    fontWeight: 600,
    // Pull the underline tight against the text so it doesn't add height.
    '&::before, &::after': {
        borderBottom: 'none',
    },
    '&:hover:not(.Mui-disabled)::before': {
        borderBottom: 'none',
    },
    '& .MuiSelect-select': {
        padding: theme.spacing(0.25, 2.5, 0.25, 0.5),
        minHeight: 'auto',
        borderRadius: theme.shape.borderRadius,
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
        },
        '&:focus': {
            backgroundColor: theme.palette.action.hover,
            borderRadius: theme.shape.borderRadius,
        },
    },
    '& .MuiSelect-icon': {
        color: theme.palette.text.secondary,
        right: theme.spacing(0.5),
    },
}));

const StyledList = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.25),
}));

// Row rhythm matches the Signals legend below the panel: small color dot, the
// name, a right-aligned figure. The chunky icon badge it replaces was visually
// fighting the goal panel's purple background.
const StyledRow = styled('button', {
    shouldForwardProp: (prop) => prop !== 'highlighted',
})<{ highlighted: boolean }>(({ theme, highlighted }) => ({
    appearance: 'none',
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(0.5, 0.75, 0.5, 1.25),
    borderRadius: theme.shape.borderRadius,
    border: 'none',
    background: highlighted
        ? withAlpha(theme.palette.primary.main, 0.08)
        : 'transparent',
    color: theme.palette.text.primary,
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
    transition: 'background 120ms ease',
    // Left-edge accent stripe — appears on hover/highlight so the eye links
    // the row to its event pill on the chart. Pinned absolutely to keep the
    // grid columns stable when toggling.
    '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: theme.spacing(0.5),
        bottom: theme.spacing(0.5),
        width: 3,
        borderRadius: 2,
        backgroundColor: highlighted
            ? theme.palette.primary.main
            : 'transparent',
        transition: 'background-color 120ms ease',
    },
    '&:hover': {
        background: withAlpha(theme.palette.primary.main, 0.04),
        '&::before': {
            backgroundColor: theme.palette.primary.main,
        },
    },
    '&:focus-visible': {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: 1,
    },
}));

const StyledDot = styled(Box)({
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
});

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
})<{ tone: 'up' | 'down' | 'flat' }>(({ theme, tone }) => ({
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
    // Centers the empty-state line vertically within the slot so the section
    // doesn't visually collapse to the top — keeps the rail's three sections
    // balanced even when there's no data to fill the middle.
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    minHeight: theme.spacing(8),
}));

export type TopFlagMoversPanelProps = {
    impacts: FlagEventImpact[];
    highlightedEventId: number | null;
    onHighlightedEventChange: (eventId: number | null) => void;
    baselineId: BaselineOptionId;
    onBaselineChange: (next: BaselineOptionId) => void;
    // Clicking a row opens a detail dialog explaining the row's Δ. Optional so
    // other templates can reuse this panel without wiring up a dialog.
    onOpenedEventChange?: (eventId: number) => void;
};

export const TopFlagMoversPanel: FC<TopFlagMoversPanelProps> = ({
    impacts,
    highlightedEventId,
    onHighlightedEventChange,
    baselineId,
    onBaselineChange,
    onOpenedEventChange,
}) => {
    const theme = useTheme();

    const measurable = useMemo(
        () =>
            impacts.filter(
                (impact) =>
                    impact.deltaPct !== null &&
                    Math.abs(impact.deltaPct) >= SMALL_CHANGE_THRESHOLD_PCT,
            ),
        [impacts],
    );
    const visible = measurable.slice(0, MAX_VISIBLE);
    const overflowCount = measurable.length - visible.length;

    return (
        <StyledRoot>
            <StyledHeader>
                <StyledLabel>Top movers</StyledLabel>
                <Tooltip
                    arrow
                    placement='top'
                    title='Goal Δ between the selected window before and after each flag flip'
                >
                    <StyledBaselineSelect
                        size='small'
                        variant='standard'
                        disableUnderline
                        value={baselineId}
                        onChange={(event) =>
                            onBaselineChange(
                                event.target.value as BaselineOptionId,
                            )
                        }
                    >
                        {BASELINE_OPTIONS.map((option) => (
                            <MenuItem key={option.id} value={option.id}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </StyledBaselineSelect>
                </Tooltip>
            </StyledHeader>
            {visible.length === 0 ? (
                <StyledEmpty>
                    {impacts.length === 0
                        ? 'No flag changes in this window.'
                        : 'No flag flips moved the goal by more than 1%.'}
                </StyledEmpty>
            ) : (
                <StyledList>
                    {visible.map((impact) => {
                        const tone = toneOf(impact);
                        const TrendIcon =
                            tone === 'up' ? TrendingUpIcon : TrendingDownIcon;
                        const eventColor = getEventColor(
                            theme,
                            impact.event.type,
                        );
                        const featureLabel =
                            impact.event.featureName ?? impact.event.label;
                        const isHighlighted =
                            highlightedEventId === impact.eventId;

                        return (
                            <StyledRow
                                key={impact.eventId}
                                type='button'
                                highlighted={isHighlighted}
                                onMouseEnter={() =>
                                    onHighlightedEventChange(impact.eventId)
                                }
                                onMouseLeave={() =>
                                    onHighlightedEventChange(null)
                                }
                                onFocus={() =>
                                    onHighlightedEventChange(impact.eventId)
                                }
                                onBlur={() => onHighlightedEventChange(null)}
                                onClick={() =>
                                    onOpenedEventChange?.(impact.eventId)
                                }
                                aria-pressed={isHighlighted}
                            >
                                <StyledDot
                                    sx={{ backgroundColor: eventColor }}
                                />
                                <StyledFlagName title={featureLabel}>
                                    {featureLabel}
                                </StyledFlagName>
                                <StyledDelta tone={tone}>
                                    <TrendIcon sx={{ fontSize: 14 }} />
                                    {formatPct(impact.deltaPct!)}
                                </StyledDelta>
                            </StyledRow>
                        );
                    })}
                    {overflowCount > 0 ? (
                        <StyledOverflow>+{overflowCount} more</StyledOverflow>
                    ) : null}
                </StyledList>
            )}
        </StyledRoot>
    );
};
