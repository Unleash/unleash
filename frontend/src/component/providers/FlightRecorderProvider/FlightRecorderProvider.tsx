import type React from 'react';
import { type FC, useEffect, useState } from 'react';
import {
    createFlightRecorder,
    type FlightRecorder,
} from '@unleash/sdk-flight-recorder';
import { useUiFlag } from 'hooks/useUiFlag';
import { getVariantValue, type Variant } from 'utils/variants';
import { FlightRecorderContext } from 'contexts/FlightRecorderContext';
import { routes } from 'component/menu/routes';
import { usePageViewTracking } from './usePageViewTracking';

// A low flushAt keeps the keepalive flush on close() well under the browser's 64 KB limit.
const BATCH = { flushAt: 100 };

export const FlightRecorderProvider: FC<{
    children?: React.ReactNode;
    createRecorder?: typeof createFlightRecorder;
}> = ({ children, createRecorder = createFlightRecorder }) => {
    const flag = useUiFlag('flightRecorderFrontend');
    const url = getVariantValue(flag as Variant);

    const [recorder, setRecorder] = useState<FlightRecorder | null>(null);

    useEffect(() => {
        if (!url) {
            return;
        }
        try {
            const instance = createRecorder({
                url,
                clientKey: '',
                batch: BATCH,
                onError: (info) =>
                    console.warn('Flight recorder dropped events', info),
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
    }, [url, createRecorder]);

    useEffect(() => {
        if (!recorder) {
            return;
        }
        const flushIfHidden = () => {
            if (document.visibilityState === 'hidden') {
                void recorder.flush({ keepalive: true });
            }
        };
        const flush = () => void recorder.flush({ keepalive: true });
        document.addEventListener('visibilitychange', flushIfHidden);
        window.addEventListener('pagehide', flush);
        return () => {
            document.removeEventListener('visibilitychange', flushIfHidden);
            window.removeEventListener('pagehide', flush);
        };
    }, [recorder]);

    usePageViewTracking(recorder, routes);

    return (
        <FlightRecorderContext.Provider value={recorder}>
            {children}
        </FlightRecorderContext.Provider>
    );
};
