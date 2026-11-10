// Engaged time: how long a page was actually looked at. Accrues only while the tab is
// visible and stops after an idle stretch, so a tab left open overnight reports minutes,
// not hours.

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // Industry standard idle cutoff

const ACTIVITY_EVENTS = [
    'mousemove',
    'mousedown',
    'keydown',
    'scroll',
    'touchstart',
] as const;

export type EngagedTimeTracker = {
    engagedMs: () => number;
    stop: () => void;
};

type StartTrackerProps = {
    now?: () => number;
    idleTimeoutMs?: number;
};

export const startEngagedTimeTracker = ({
    now = () => performance.now(),
    idleTimeoutMs = IDLE_TIMEOUT_MS,
}: StartTrackerProps = {}): EngagedTimeTracker => {
    const isVisible = () => document.visibilityState === 'visible';

    let accumulated = 0;
    let segmentStart: number | null = isVisible() ? now() : null;
    let lastActivity = now();

    // Current segment, capped so idle time past the timeout doesn't count.
    const liveSegment = (): number => {
        if (segmentStart === null) {
            return 0;
        }
        const idleCap = lastActivity + idleTimeoutMs;
        return Math.max(0, Math.min(now(), idleCap) - segmentStart);
    };

    const commit = () => {
        accumulated += liveSegment();
        segmentStart = null;
    };

    const onVisibilityChange = () => {
        if (!isVisible()) {
            commit();
        } else if (segmentStart === null) {
            lastActivity = now();
            segmentStart = now();
        }
    };

    const onActivity = () => {
        const currentTime = now();
        // After an idle gap, bank the capped segment and start fresh.
        if (
            segmentStart !== null &&
            currentTime - lastActivity >= idleTimeoutMs
        ) {
            commit();
            segmentStart = currentTime;
        }
        lastActivity = currentTime;
    };

    // Capture so in-container scrolls count (scroll doesn't bubble to document).
    const activityOptions = { passive: true, capture: true } as const;
    const listeners: {
        event: string;
        handler: () => void;
        options?: AddEventListenerOptions;
    }[] = [
        { event: 'visibilitychange', handler: onVisibilityChange },
        ...ACTIVITY_EVENTS.map((event) => ({
            event,
            handler: onActivity,
            options: activityOptions,
        })),
    ];

    for (const { event, handler, options } of listeners) {
        document.addEventListener(event, handler, options);
    }

    return {
        engagedMs: () => Math.round(accumulated + liveSegment()),
        stop: () => {
            for (const { event, handler, options } of listeners) {
                document.removeEventListener(event, handler, options);
            }
        },
    };
};
