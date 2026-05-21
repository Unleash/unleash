import { useEffect } from 'react';
import LogRocket from 'logrocket';
import { scrubUrl } from './scrubUrl';

type Props = {
    appId: string;
    clientId: string;
    userId: number;
};

const LogRocketRunner = ({ appId, clientId, userId }: Props) => {
    useEffect(() => {
        try {
            LogRocket.init(appId, {
                dom: {
                    textSanitizer: true,
                    inputSanitizer: 'lipsum',
                },
                shouldCaptureIP: false,
                network: {
                    requestSanitizer: ({ reqId, method, url }) => ({
                        reqId,
                        method,
                        url: scrubUrl(url),
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
        } catch (error) {
            console.warn(error);
        }
    }, [appId, clientId, userId]);

    return null;
};

export default LogRocketRunner;
