import { useCallback, useEffect, useRef } from 'react';
import { useEventTracker } from 'hooks/useEventTracker';
import type { DialogDismissMethod, DialogTracking } from 'utils/trackingEvents';

export const useTrackDialogDismissed = () => {
    const { trackEvent } = useEventTracker();

    return useCallback(
        (tracking: DialogTracking | undefined, method: DialogDismissMethod) => {
            if (!tracking) {
                trackEvent('dialog-dismissed', {
                    props: { action: 'dismissed', method },
                });
                return;
            }
            trackEvent(tracking.event, {
                props: {
                    ...(tracking.type ? { eventType: tracking.type } : {}),
                    action: 'dismissed',
                    method,
                },
            });
        },
        [trackEvent],
    );
};

export const dismissMethodFromCloseReason = (
    reason: string | undefined,
): DialogDismissMethod => (reason === 'backdropClick' ? 'backdrop' : 'escape');

// One dismissal can fire two close paths: a manual Escape handler and MUI's onClose.
export const useDialogDismissTracking = (
    open: boolean,
    tracking: DialogTracking | undefined,
) => {
    const trackDialogDismissed = useTrackDialogDismissed();
    const emittedRef = useRef(false);

    useEffect(() => {
        if (open) {
            emittedRef.current = false;
        }
    }, [open]);

    const { event, type } = tracking ?? {};
    return useCallback(
        (method: DialogDismissMethod) => {
            if (emittedRef.current) {
                return;
            }
            emittedRef.current = true;
            trackDialogDismissed(event ? { event, type } : undefined, method);
        },
        [trackDialogDismissed, event, type],
    );
};
