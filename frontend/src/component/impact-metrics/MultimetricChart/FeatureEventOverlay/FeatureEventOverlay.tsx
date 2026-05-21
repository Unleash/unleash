import type { FC } from 'react';
import { Box, styled } from '@mui/material';
import { FeatureEventMarker } from './FeatureEventMarker';
import type { EventGroup } from './eventTheme';
import type { PlotArea } from '../useChartPlotArea';

export type { EventGroup } from './eventTheme';
export { groupEventsByProximity, buildEventAnnotations } from './eventGrouping';

const StyledEventStrip = styled(Box)({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 28,
    pointerEvents: 'none',
});

type FeatureEventOverlayProps = {
    groups: EventGroup[];
    plotArea: PlotArea;
    highlightedEventId?: number | null;
    eventImpactById?: Record<
        number,
        {
            deltaPct: number | null;
            deltaAbs: number | null;
            halfWindowMs: number;
        }
    >;
};

// Absolutely-positioned strip across the top of the plot area that hosts all
// event markers. Positioned to match the Chart.js plot bounds so pills line
// up with the vertical annotation lines underneath.
export const FeatureEventOverlay: FC<FeatureEventOverlayProps> = ({
    groups,
    plotArea,
    highlightedEventId = null,
    eventImpactById,
}) => (
    <StyledEventStrip
        sx={{
            left: `${plotArea.leftPx}px`,
            width: `${plotArea.widthPx}px`,
            right: 'auto',
        }}
    >
        {groups.map((group) => {
            const isHighlighted =
                highlightedEventId !== null &&
                group.events.some((event) => event.id === highlightedEventId);
            return (
                <FeatureEventMarker
                    key={group.events[0].id}
                    group={group}
                    highlighted={isHighlighted}
                    eventImpactById={eventImpactById}
                />
            );
        })}
    </StyledEventStrip>
);
