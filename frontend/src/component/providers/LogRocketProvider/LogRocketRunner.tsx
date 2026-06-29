import { useEffect, useRef } from 'react';
import LogRocket from 'logrocket';
import { scrubUrl, scrubBrowserUrl, isStaticAsset } from './scrubUrl';
import type { LogRocketInstance } from 'contexts/LogRocketContext';

type Props = {
    appId: string;
    clientId: string;
    userId: number;
    onReady: (instance: LogRocketInstance) => void;
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
                browser: {
                    urlSanitizer: (url) => scrubBrowserUrl(url),
                },
                network: {
                    requestSanitizer: ({ reqId, method, url }) => ({
                        reqId,
                        method,
                        url: isStaticAsset(url) ? url : scrubUrl(url),
                        headers: {},
                        body: undefined,
                    }),
                    responseSanitizer: ({ reqId, method, status }) => ({
                        reqId,
                        method,
                        status,
                        headers: {},
                        body: undefined,
                    }),
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
