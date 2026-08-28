import type React from 'react';
import { type FC, useEffect, useState } from 'react';
import {
    createFlightRecorder,
    type FlightRecorder,
} from '@unleash/sdk-flight-recorder';
import { useUiFlag } from 'hooks/useUiFlag';
import { getVariantValue, type Variant } from 'utils/variants';
import { FlightRecorderContext } from 'contexts/FlightRecorderContext';
import { isLocalhostDomain } from 'utils/env';
import { usePageViewTracking } from './usePageViewTracking';

// A low flushAt keeps the keepalive flush on close() well under the browser's 64 KB limit.
const BATCH = { flushAt: 100 };

// Flip to record from localhost, e.g. when working on the ingestion pipeline.
const LOCAL_TESTING = false;

export const FlightRecorderProvider: FC<{
    children?: React.ReactNode;
    createRecorder?: typeof createFlightRecorder;
    hostname: string;
}> = ({ children, createRecorder = createFlightRecorder, hostname }) => {
    const flag = useUiFlag('flightRecorderFrontend');
    const url = getVariantValue(flag as Variant);

    const [recorder, setRecorder] = useState<FlightRecorder | null>(null);

    useEffect(() => {
        // Local dev against a hosted backend still receives the flag with the
        // production ingestion URL; dev traffic must not pollute production data.
        if (!url || (isLocalhostDomain(hostname) && !LOCAL_TESTING)) {
            return;
        }
        try {
            const instance = createRecorder({
                url,
                clientKey: '',
                batch: BATCH,
                // deliveryFailed is retried and routine in browsers
                // (flaky wifi, adblockers) — warn only on real losses
                onError: (info) => {
                    if (info.reason !== 'deliveryFailed') {
                        console.warn('Flight recorder dropped events', info);
                    }
                },
            });
            setRecorder(instance);
            return () => {
                setRecorder(null);
                void instance.close();
            };
        } catch (error) {
            console.warn(error);
        }
        // createRecorder is a stable ref (module default or a fixture), so it won't refire.
    }, [url, createRecorder, hostname]);

    // Flush on backgrounding; unload (pagehide) is owned by usePageViewTracking.
    useEffect(() => {
        if (!recorder) {
            return;
        }
        const flushIfHidden = () => {
            if (document.visibilityState === 'hidden') {
                void recorder.flush({ keepalive: true });
            }
        };
        document.addEventListener('visibilitychange', flushIfHidden);
        return () =>
            document.removeEventListener('visibilitychange', flushIfHidden);
    }, [recorder]);

    usePageViewTracking(recorder);

    return (
        <FlightRecorderContext.Provider value={recorder}>
            {children}
        </FlightRecorderContext.Provider>
    );
};
