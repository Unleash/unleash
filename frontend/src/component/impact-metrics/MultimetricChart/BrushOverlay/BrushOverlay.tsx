import {
    useRef,
    useState,
    type FC,
    type MutableRefObject,
    type PointerEvent as ReactPointerEvent,
    type ReactNode,
} from 'react';
import { Box, styled } from '@mui/material';
import type { Chart as ChartInstance } from 'chart.js';
import { withAlpha } from '../chartConfig';
import type { VisibleWindow } from '../chartConfig';
import type { TimeWindow } from '../types';
import type { PlotArea } from '../useChartPlotArea';

// A drag below this many pixels is treated as a click (clears the selection)
// rather than the start of a new brush.
const CLICK_THRESHOLD_PX = 3;

const StyledRoot = styled(Box)({
    position: 'absolute',
    top: 0,
    bottom: 0,
    // Sits above the canvas to capture pointer gestures for brushing. The
    // top event-marker strip has its own layer, so marker tooltips still work.
    cursor: 'crosshair',
    touchAction: 'none',
});

const StyledRegion = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: withAlpha(theme.palette.primary.main, 0.12),
    borderLeft: `1px solid ${withAlpha(theme.palette.primary.main, 0.5)}`,
    borderRight: `1px solid ${withAlpha(theme.palette.primary.main, 0.5)}`,
}));

const StyledHandle = styled('button')(({ theme }) => ({
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 9,
    margin: 0,
    padding: 0,
    border: 'none',
    cursor: 'ew-resize',
    background: 'none',
    transform: 'translateX(-50%)',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: '50%',
        width: 2,
        transform: 'translateX(-50%)',
        backgroundColor: theme.palette.primary.main,
    },
    '&:focus-visible': {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: 1,
    },
}));

// A dashed vertical line marking a single flag flip on the plot, shown while
// its row is hovered in the popover.
const StyledFlipMarker = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 0,
    pointerEvents: 'none',
    borderLeft: `2px dashed ${theme.palette.primary.main}`,
    transform: 'translateX(-1px)',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: -3,
        left: '50%',
        width: 7,
        height: 7,
        borderRadius: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: theme.palette.primary.main,
    },
}));

type BrushOverlayProps = {
    plotArea: PlotArea;
    chartRef: MutableRefObject<ChartInstance<'line'> | null>;
    visibleWindow: VisibleWindow;
    selection: TimeWindow | null;
    onSelectionChange: (selection: TimeWindow | null) => void;
    // When set, draws a marker line on the plot at this flip's timestamp —
    // used to highlight a flag change as its row is hovered in the popover.
    highlightedFlipMs?: number | null;
    // Renders a drill-down anchored to the committed selection band. Called
    // with the band element (anchor) and whether a drag is in progress (so the
    // consumer can hide the popover mid-gesture).
    renderPopover?: (
        anchorEl: HTMLElement | null,
        isDragging: boolean,
    ) => ReactNode;
};

type DragState =
    | { kind: 'create'; anchorMs: number }
    | { kind: 'resize'; edge: 'from' | 'to' };

export const BrushOverlay: FC<BrushOverlayProps> = ({
    plotArea,
    chartRef,
    visibleWindow,
    selection,
    onSelectionChange,
    highlightedFlipMs = null,
    renderPopover,
}) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<DragState | null>(null);
    // Tracked in state (not a ref) so the popover re-anchors once the band
    // element mounts/changes.
    const [regionEl, setRegionEl] = useState<HTMLDivElement | null>(null);
    // Ephemeral in-gesture selection so we only commit to the lifted state on
    // pointer-up; null means "use the committed `selection` prop".
    const [draft, setDraft] = useState<TimeWindow | null>(null);

    const clamp = (ms: number) =>
        Math.min(Math.max(ms, visibleWindow.minMs), visibleWindow.maxMs);

    // Overlay-local pixel → time. The overlay's left edge is the plot's left
    // edge, so a local x maps to canvas pixel `chartArea.left + x`.
    const pixelToMs = (clientX: number): number | null => {
        const chart = chartRef.current;
        const root = rootRef.current;
        if (!chart || !root) return null;
        const localX = clientX - root.getBoundingClientRect().left;
        const value = chart.scales.x.getValueForPixel(
            chart.chartArea.left + localX,
        );
        return value === undefined ? null : clamp(value);
    };

    // Time → overlay-local pixel (for positioning the region + handles).
    const msToPixel = (ms: number): number => {
        const chart = chartRef.current;
        if (!chart) return 0;
        return chart.scales.x.getPixelForValue(ms) - chart.chartArea.left;
    };

    const active = draft ?? selection;

    const handleRootPointerDown = (event: ReactPointerEvent) => {
        // Ignore clicks that originate on the handles / clear button.
        if (event.target !== event.currentTarget) return;
        const anchorMs = pixelToMs(event.clientX);
        if (anchorMs === null) return;
        dragRef.current = { kind: 'create', anchorMs };
        setDraft({ fromMs: anchorMs, toMs: anchorMs });
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handleHandlePointerDown =
        (edge: 'from' | 'to') => (event: ReactPointerEvent) => {
            event.stopPropagation();
            dragRef.current = { kind: 'resize', edge };
            setDraft(selection);
            event.currentTarget.setPointerCapture(event.pointerId);
        };

    const handlePointerMove = (event: ReactPointerEvent) => {
        const drag = dragRef.current;
        if (!drag) return;
        const ms = pixelToMs(event.clientX);
        if (ms === null) return;
        if (drag.kind === 'create') {
            setDraft({
                fromMs: Math.min(drag.anchorMs, ms),
                toMs: Math.max(drag.anchorMs, ms),
            });
        } else {
            setDraft((prev) => {
                const base = prev ?? selection;
                if (!base) return prev;
                const next =
                    drag.edge === 'from'
                        ? { fromMs: ms, toMs: base.toMs }
                        : { fromMs: base.fromMs, toMs: ms };
                // Keep from <= to; if the dragged edge crosses, swap roles so
                // the gesture stays continuous.
                if (next.fromMs > next.toMs) {
                    dragRef.current = {
                        kind: 'resize',
                        edge: drag.edge === 'from' ? 'to' : 'from',
                    };
                    return { fromMs: next.toMs, toMs: next.fromMs };
                }
                return next;
            });
        }
    };

    const handlePointerUp = () => {
        const drag = dragRef.current;
        dragRef.current = null;
        const committed = draft;
        setDraft(null);
        if (!drag) return;
        if (!committed) return;
        // A create gesture that didn't move is a click → clear the selection.
        if (
            drag.kind === 'create' &&
            Math.abs(msToPixel(committed.toMs) - msToPixel(committed.fromMs)) <
                CLICK_THRESHOLD_PX
        ) {
            onSelectionChange(null);
            return;
        }
        onSelectionChange(committed);
    };

    const nudge = (edge: 'from' | 'to', deltaMs: number) => {
        if (!selection) return;
        const next =
            edge === 'from'
                ? {
                      fromMs: clamp(selection.fromMs + deltaMs),
                      toMs: selection.toMs,
                  }
                : {
                      fromMs: selection.fromMs,
                      toMs: clamp(selection.toMs + deltaMs),
                  };
        if (next.fromMs > next.toMs) return;
        onSelectionChange(next);
    };

    const handleHandleKeyDown =
        (edge: 'from' | 'to') => (event: React.KeyboardEvent) => {
            const step = visibleWindow.rangeMs / 100;
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                nudge(edge, -step);
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                nudge(edge, step);
            } else if (event.key === 'Escape') {
                event.preventDefault();
                onSelectionChange(null);
            }
        };

    const fromPx = active ? msToPixel(active.fromMs) : 0;
    const toPx = active ? msToPixel(active.toMs) : 0;

    return (
        <StyledRoot
            ref={rootRef}
            sx={{
                left: `${plotArea.leftPx}px`,
                width: `${plotArea.widthPx}px`,
            }}
            onPointerDown={handleRootPointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
            {active ? (
                <StyledRegion
                    ref={setRegionEl}
                    sx={{ left: `${fromPx}px`, width: `${toPx - fromPx}px` }}
                >
                    <StyledHandle
                        type='button'
                        aria-label='Selection start handle'
                        sx={{ left: 0 }}
                        onPointerDown={handleHandlePointerDown('from')}
                        onKeyDown={handleHandleKeyDown('from')}
                    />
                    <StyledHandle
                        type='button'
                        aria-label='Selection end handle'
                        sx={{ left: '100%' }}
                        onPointerDown={handleHandlePointerDown('to')}
                        onKeyDown={handleHandleKeyDown('to')}
                    />
                </StyledRegion>
            ) : null}
            {highlightedFlipMs !== null ? (
                <StyledFlipMarker
                    sx={{ left: `${msToPixel(highlightedFlipMs)}px` }}
                />
            ) : null}
            {/* The anchored drill-down for a committed selection. */}
            {selection && renderPopover
                ? renderPopover(regionEl, draft !== null)
                : null}
        </StyledRoot>
    );
};
