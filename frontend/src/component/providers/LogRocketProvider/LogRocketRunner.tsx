import { useEffect, useRef } from 'react';
import LogRocket from 'logrocket';
import type { LogRocketTracker } from 'contexts/LogRocketContext';

type Props = {
    appId: string;
    clientId: string;
    userId: number;
    onReady: (tracker: LogRocketTracker) => void;
};

const LogRocketRunner = ({ appId, clientId, userId, onReady }: Props) => {
    // make sure we won't re-initialize even if onReady isn't stable
    const onReadyRef = useRef(onReady);
    onReadyRef.current = onReady;

    useEffect(() => {
        try {
            LogRocket.init(appId, {
                dom: {
                    textSanitizer: true,
                    inputSanitizer: 'lipsum',
                },
                shouldCaptureIP: false,
                network: {
                    requestSanitizer: () => null,
                },
            });
            LogRocket.identify(`${clientId}:${userId}`, {
                clientId,
                userId: String(userId),
            });
            onReadyRef.current({ track: LogRocket.track.bind(LogRocket) });
        } catch (error) {
            console.warn(error);
        }
    }, [appId, clientId, userId]);

    return null;
};

export default LogRocketRunner;
