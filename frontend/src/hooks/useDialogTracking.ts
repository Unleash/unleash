import { useCallback, useEffect, useRef } from 'react';
import { useEventTracker } from 'hooks/useEventTracker';
import {
    type DialogDismissMethod,
    emitTrackingAction,
    type Tracking,
} from 'utils/trackingEvents';

export const dismissMethodFromCloseReason = (
    reason: string | undefined,
): DialogDismissMethod => (reason === 'backdropClick' ? 'backdrop' : 'escape');

// A dismissal fires twice, from a manual Escape handler and from MUI's onClose, so only
// the first emission counts.
export const useDialogTracking = (
    open: boolean,
    tracking: Tracking | undefined,
) => {
    const { trackEvent } = useEventTracker();
    const emittedRef = useRef(false);
    const trackingRef = useRef(tracking);
    trackingRef.current = tracking;

    useEffect(() => {
        if (open) {
            emittedRef.current = false;
        }
    }, [open]);

    return useCallback(
        (method: DialogDismissMethod) => {
            if (emittedRef.current) {
                return;
            }
            emittedRef.current = true;

            const declaration = trackingRef.current;
            // Dialogs with no declaration still count toward dismissal volume.
            if (!declaration) {
                trackEvent('dialog-dismissed', {
                    props: { action: 'dismissed', method },
                });
                return;
            }
            emitTrackingAction(trackEvent, declaration, 'dismissed', {
                method,
            });
        },
        [trackEvent],
    );
};
