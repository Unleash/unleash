import { useEffect } from 'react';
import LogRocket from 'logrocket';

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
                    requestSanitizer: () => null,
                },
            });
            LogRocket.identify(`${clientId}:${userId}`, {
                clientId,
                userId: String(userId),
            });
        } catch (error) {
            console.warn(error);
        }
    }, []);

    return null;
};

export default LogRocketRunner;
