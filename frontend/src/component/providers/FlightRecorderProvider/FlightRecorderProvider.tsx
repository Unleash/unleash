import type React from 'react';
import { type FC, useEffect, useState } from 'react';
import {
    createFlightRecorder,
    type FlightRecorder,
} from '@unleash/sdk-flight-recorder';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { FlightRecorderContext } from 'contexts/FlightRecorderContext';

// Custom UI events are low-frequency, so the periodic timer does the flushing
// and the buffer stays small. Keep flushAt low so the keepalive flush on
// close() stays well under the 64 KB browser limit (~35 KB at 350 bytes/event).
const BATCH = { flushAt: 100 };

export const FlightRecorderProvider: FC<{ children?: React.ReactNode }> = ({
    children,
}) => {
    const { uiConfig } = useUiConfig();
    const url = uiConfig?.flightRecorderUrl;

    const [recorder, setRecorder] = useState<FlightRecorder | null>(null);

    useEffect(() => {
        if (!url) {
            return;
        }
        try {
            const instance = createFlightRecorder({
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
    }, [url]);

    return (
        <FlightRecorderContext.Provider value={recorder}>
            {children}
        </FlightRecorderContext.Provider>
    );
};
