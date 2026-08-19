import { useCallback, useEffect, useRef, useState } from 'react';
import type { DraggableData, DraggableEvent } from 'react-draggable';

interface Position {
    x: number;
    y: number;
}

const VIEWPORT_MARGIN = 24;
const ZERO: Position = { x: 0, y: 0 };

interface Rect {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

interface ConcreteBounds {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

const naturalRectOf = (node: HTMLElement, appliedTranslate: Position): Rect => {
    const rect = node.getBoundingClientRect();
    return {
        left: rect.left - appliedTranslate.x,
        top: rect.top - appliedTranslate.y,
        right: rect.right - appliedTranslate.x,
        bottom: rect.bottom - appliedTranslate.y,
    };
};

// Excludes the scrollbar, unlike innerWidth/Height.
const boundsFromNaturalRect = (natural: Rect): ConcreteBounds => {
    const layoutWidth = document.documentElement.clientWidth;
    const layoutHeight = document.documentElement.clientHeight;
    return {
        left: VIEWPORT_MARGIN - natural.left,
        top: VIEWPORT_MARGIN - natural.top,
        right: layoutWidth - VIEWPORT_MARGIN - natural.right,
        bottom: layoutHeight - VIEWPORT_MARGIN - natural.bottom,
    };
};

// Collapse inverted bounds (no room on an axis) to a locked point.
const normalizeBounds = (b: ConcreteBounds): ConcreteBounds => {
    const midX = (b.left + b.right) / 2;
    const midY = (b.top + b.bottom) / 2;
    return {
        left: Math.min(b.left, midX),
        right: Math.max(b.right, midX),
        top: Math.min(b.top, midY),
        bottom: Math.max(b.bottom, midY),
    };
};

const clampToBounds = (pos: Position, bounds: ConcreteBounds): Position => ({
    x: Math.min(Math.max(pos.x, bounds.left), bounds.right),
    y: Math.min(Math.max(pos.y, bounds.top), bounds.bottom),
});

const hasRoom = (bounds: ConcreteBounds): boolean =>
    bounds.left !== bounds.right || bounds.top !== bounds.bottom;

const boundsEqual = (
    a: ConcreteBounds | undefined,
    b: ConcreteBounds,
): boolean =>
    !!a &&
    a.left === b.left &&
    a.right === b.right &&
    a.top === b.top &&
    a.bottom === b.bottom;

const positionEqual = (a: Position, b: Position): boolean =>
    a.x === b.x && a.y === b.y;

interface UseDraggableWindowOptions {
    position: Position | null;
    onPositionChange: (position: Position) => void;
}

export const useDraggableWindow = ({
    position,
    onPositionChange,
}: UseDraggableWindowOptions) => {
    const nodeRef = useRef<HTMLElement>(null);
    const [dragging, setDragging] = useState(false);
    const [bounds, setBounds] = useState<ConcreteBounds | undefined>(undefined);

    // Stable refs so inline callback props don't re-register the observer.
    const positionRef = useRef(position);
    positionRef.current = position;
    const onPositionChangeRef = useRef(onPositionChange);
    onPositionChangeRef.current = onPositionChange;

    const refresh = useCallback(() => {
        const node = nodeRef.current;
        if (!node) return;
        const natural = naturalRectOf(node, positionRef.current ?? ZERO);
        const next = normalizeBounds(boundsFromNaturalRect(natural));
        // Break the ResizeObserver → setState → layout feedback loop.
        setBounds((prev) => (boundsEqual(prev, next) ? prev : next));
        const current = positionRef.current;
        if (!current) return;
        const clipped = clampToBounds(current, next);
        if (!positionEqual(current, clipped)) {
            onPositionChangeRef.current(clipped);
        }
    }, []);

    useEffect(() => {
        refresh();
        window.addEventListener('resize', refresh);
        const observer =
            typeof ResizeObserver !== 'undefined'
                ? new ResizeObserver(refresh)
                : null;
        const node = nodeRef.current;
        if (node && observer) observer.observe(node);
        return () => {
            window.removeEventListener('resize', refresh);
            observer?.disconnect();
        };
    }, [refresh]);

    const onStart = useCallback(() => setDragging(true), []);
    const onStop = useCallback(() => setDragging(false), []);
    const onDrag = useCallback((_: DraggableEvent, data: DraggableData) => {
        // react-draggable has already clipped against `bounds`.
        onPositionChangeRef.current({ x: data.x, y: data.y });
    }, []);

    // Default true pre-measurement so the handle doesn't flash off.
    const canDrag = bounds === undefined || hasRoom(bounds);

    return {
        nodeRef,
        position: position ?? ZERO,
        dragging,
        bounds,
        canDrag,
        onStart,
        onStop,
        onDrag,
    };
};
