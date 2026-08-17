import {
    type PointerEvent as ReactPointerEvent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

interface Position {
    x: number;
    y: number;
}

// Kept at module scope so the dragged position survives the MainLayout
// remount that happens on route change, but resets to the default anchor on a
// full page reload (the JS reboots and this goes back to `null`).
let sharedPosition: Position | null = null;

const VIEWPORT_MARGIN = 8;

const clampToViewport = (
    { x, y }: Position,
    width: number,
    height: number,
): Position => {
    const maxX = Math.max(
        VIEWPORT_MARGIN,
        window.innerWidth - width - VIEWPORT_MARGIN,
    );
    const maxY = Math.max(
        VIEWPORT_MARGIN,
        window.innerHeight - height - VIEWPORT_MARGIN,
    );
    return {
        x: Math.min(Math.max(x, VIEWPORT_MARGIN), maxX),
        y: Math.min(Math.max(y, VIEWPORT_MARGIN), maxY),
    };
};

/**
 * Makes a `position: fixed` window draggable by a handle element via native
 * pointer events. Until the first drag, `position` is `null` and the window
 * keeps its CSS-anchored spot; after that it's positioned by `top`/`left`.
 */
export const useDraggableWindow = () => {
    const windowRef = useRef<HTMLElement | null>(null);
    const [position, setPosition] = useState<Position | null>(sharedPosition);
    const [dragging, setDragging] = useState(false);

    useEffect(() => {
        sharedPosition = position;
    }, [position]);

    // Offset from the window's top-left to the pointer, plus its size, frozen
    // at drag start so movement math stays stable across the drag.
    const dragOrigin = useRef<{
        pointerOffsetX: number;
        pointerOffsetY: number;
        width: number;
        height: number;
    } | null>(null);

    const onPointerDown = useCallback((event: ReactPointerEvent) => {
        if (event.button !== 0) return;
        const node = windowRef.current;
        if (!node) return;
        // Let the header's own controls (minimize/close) handle their clicks.
        if ((event.target as HTMLElement).closest('button')) return;

        const rect = node.getBoundingClientRect();
        dragOrigin.current = {
            pointerOffsetX: event.clientX - rect.left,
            pointerOffsetY: event.clientY - rect.top,
            width: rect.width,
            height: rect.height,
        };
        setDragging(true);
        event.currentTarget.setPointerCapture(event.pointerId);
    }, []);

    const onPointerMove = useCallback((event: ReactPointerEvent) => {
        const origin = dragOrigin.current;
        if (!origin) return;
        setPosition(
            clampToViewport(
                {
                    x: event.clientX - origin.pointerOffsetX,
                    y: event.clientY - origin.pointerOffsetY,
                },
                origin.width,
                origin.height,
            ),
        );
    }, []);

    const endDrag = useCallback((event: ReactPointerEvent) => {
        if (!dragOrigin.current) return;
        dragOrigin.current = null;
        setDragging(false);
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    }, []);

    // Keep the window on-screen if the viewport shrinks under it.
    useEffect(() => {
        const onResize = () => {
            const node = windowRef.current;
            if (!node || !sharedPosition) return;
            const rect = node.getBoundingClientRect();
            setPosition((prev) =>
                prev ? clampToViewport(prev, rect.width, rect.height) : prev,
            );
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const handleProps = {
        onPointerDown,
        onPointerMove,
        onPointerUp: endDrag,
        onPointerCancel: endDrag,
    };

    return { windowRef, position, dragging, handleProps };
};
