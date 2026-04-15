import type { Theme } from '@mui/material';
import type { MultimetricFeatureEvent } from '../types';

// Both event types use shades of the primary purple so the chart reads
// cohesively. Enabled = darker (active), disabled = lighter (muted).
export const getEventColor = (
    theme: Theme,
    type: MultimetricFeatureEvent['type'],
): string => {
    switch (type) {
        case 'feature-environment-enabled':
            return theme.palette.primary.dark;
        case 'feature-environment-disabled':
            return theme.palette.primary.light;
    }
};

export const EVENT_TYPE_LABEL: Record<MultimetricFeatureEvent['type'], string> =
    {
        'feature-environment-enabled': 'Enabled',
        'feature-environment-disabled': 'Disabled',
    };

export type EventGroup = {
    /** Position along the x-axis as a percent of the visible range. */
    pct: number;
    events: MultimetricFeatureEvent[];
};
