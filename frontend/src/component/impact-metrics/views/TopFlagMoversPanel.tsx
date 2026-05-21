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
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
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

const StyledBaselineSelect = styled(Select)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    '& .MuiSelect-select': {
        padding: theme.spacing(0.25, 1.5, 0.25, 0.75),
        minHeight: 'auto',
    },
}));

const StyledList = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.25),
}));

const StyledRow = styled('button', {
    shouldForwardProp: (prop) => prop !== 'highlighted',
})<{ highlighted: boolean }>(({ theme, highlighted }) => ({
    appearance: 'none',
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    padding: theme.spacing(0.25, 0.75),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${highlighted ? theme.palette.primary.main : 'transparent'}`,
    background: highlighted
        ? withAlpha(theme.palette.primary.main, 0.08)
        : 'transparent',
    color: theme.palette.text.primary,
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
    transition: 'background 120ms ease, border-color 120ms ease',
    '&:hover': {
        background: theme.palette.action.hover,
    },
    '&:focus-visible': {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: 1,
    },
}));

const StyledDot = styled(Box)({
    width: 18,
    height: 18,
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
});

const StyledFlagName = styled(Box)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
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
    paddingLeft: theme.spacing(0.75),
}));

const StyledEmpty = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
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
                        variant='outlined'
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
                                <StyledDot sx={{ backgroundColor: eventColor }}>
                                    <PowerSettingsNewIcon
                                        sx={{ fontSize: 11, color: '#fff' }}
                                    />
                                </StyledDot>
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
