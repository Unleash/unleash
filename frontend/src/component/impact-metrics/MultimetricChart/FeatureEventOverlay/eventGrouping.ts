import type { Theme } from '@mui/material';
import type { MultimetricFeatureEvent } from '../types';
import type { VisibleWindow } from '../chartConfig';
import { type EventGroup, getEventColor } from './eventTheme';

// Collapses events that land within `PROXIMITY_PCT` of each other on the
// x-axis into a single group, so the strip shows one pill instead of a
// cluster of overlapping ones.
export const groupEventsByProximity = (
    events: MultimetricFeatureEvent[],
    window: VisibleWindow,
): EventGroup[] => {
    const PROXIMITY_PCT = 3;
    const sorted = [...events].sort(
        (left, right) => left.timestamp - right.timestamp,
    );
    const groups: EventGroup[] = [];
    for (const event of sorted) {
        const pct = ((event.timestamp - window.minMs) / window.rangeMs) * 100;
        const last = groups[groups.length - 1];
        // `sorted` is ascending, so `pct - last.pct` is always >= 0 — no abs needed.
        if (last && pct - last.pct < PROXIMITY_PCT) {
            last.events.push(event);
            last.pct += (pct - last.pct) / last.events.length;
        } else {
            groups.push({ pct, events: [event] });
        }
    }
    return groups;
};

// Builds the Chart.js annotation config that draws one dashed vertical line
// per event group, lined up exactly with the pills on the overlay strip.
// When `highlightedEventId` matches any event in a group, that group's line
// renders solid + thicker so it visually responds to row hover in the
// contributing-flag-changes panel.
export const buildEventAnnotations = (
    groups: EventGroup[],
    theme: Theme,
    highlightedEventId: number | null = null,
): Record<string, object> =>
    groups.reduce<Record<string, object>>((acc, group, index) => {
        const primary = group.events[group.events.length - 1];
        const color = getEventColor(theme, primary.type);
        const isHighlighted =
            highlightedEventId !== null &&
            group.events.some((event) => event.id === highlightedEventId);
        acc[`event-line-${index}`] = {
            type: 'line',
            xMin: primary.timestamp,
            xMax: primary.timestamp,
            borderColor: isHighlighted ? theme.palette.primary.main : color,
            borderWidth: isHighlighted ? 3 : 1.5,
            borderDash: isHighlighted ? [] : [4, 3],
        };
        return acc;
    }, {});
