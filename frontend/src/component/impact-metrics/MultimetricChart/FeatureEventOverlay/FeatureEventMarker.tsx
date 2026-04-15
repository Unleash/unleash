import type { FC } from 'react';
import { Box, Tooltip, Typography, styled, useTheme } from '@mui/material';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import { withAlpha } from '../chartConfig';
import { type EventGroup, getEventColor } from './eventTheme';
import { FeatureEventTooltip } from './FeatureEventTooltip';

const StyledMarkerWrapper = styled(Box)({
    position: 'absolute',
    top: '50%',
    pointerEvents: 'auto',
    transform: 'translate(-50%, -50%)',
});

// Outlined pill marker — white background with a colored border; the icon and
// count inherit the pill's themed color, keeping the chart calm.
const StyledMarker = styled(Box)(({ theme }) => ({
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    height: 20,
    padding: theme.spacing(0, 0.75),
    borderRadius: 999,
    backgroundColor: theme.palette.background.paper,
    cursor: 'pointer',
    boxShadow: theme.shadows[1],
    transition: 'box-shadow 150ms ease, background-color 150ms ease',
    '&:hover': {
        boxShadow: theme.shadows[3],
    },
}));

const StyledMarkerCount = styled(Typography)({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 700,
    lineHeight: 1,
    letterSpacing: '0.02em',
});

// One pill on the overlay strip. Wraps the marker in an MUI Tooltip that
// renders the detailed event breakdown on hover.
export const FeatureEventMarker: FC<{ group: EventGroup }> = ({ group }) => {
    const theme = useTheme();
    const clampedPct = Math.max(0, Math.min(100, group.pct));
    const primary = group.events[group.events.length - 1];
    const primaryColor = getEventColor(theme, primary.type);
    const isGrouped = group.events.length > 1;

    return (
        <Tooltip
            arrow
            placement='top'
            componentsProps={{
                tooltip: {
                    sx: {
                        bgcolor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        padding: theme.spacing(1.25, 1.5),
                        borderRadius: theme.shape.borderRadiusMedium,
                        boxShadow: theme.shadows[6],
                        border: `1px solid ${theme.palette.divider}`,
                        maxWidth: 320,
                    },
                },
                arrow: {
                    sx: {
                        color: theme.palette.background.paper,
                        '&::before': {
                            border: `1px solid ${theme.palette.divider}`,
                        },
                    },
                },
            }}
            title={<FeatureEventTooltip group={group} />}
        >
            <StyledMarkerWrapper sx={{ left: `${clampedPct}%` }}>
                <StyledMarker
                    sx={{
                        border: `1.5px solid ${primaryColor}`,
                        backgroundColor: withAlpha(primaryColor, 0.12),
                        color: primaryColor,
                    }}
                >
                    <PowerSettingsNewIcon
                        sx={{ fontSize: 13, color: primaryColor }}
                    />
                    {isGrouped && (
                        <StyledMarkerCount sx={{ color: primaryColor }}>
                            {group.events.length}
                        </StyledMarkerCount>
                    )}
                </StyledMarker>
            </StyledMarkerWrapper>
        </Tooltip>
    );
};
