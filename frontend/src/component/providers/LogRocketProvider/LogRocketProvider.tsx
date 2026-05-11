import type React from 'react';
import { type FC, useEffect, useRef } from 'react';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useUiFlag } from 'hooks/useUiFlag';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';

export const LogRocketProvider: FC<{ children?: React.ReactNode }> = ({
    children,
}) => {
    const { uiConfig, isEnterprise } = useUiConfig();
    const { user } = useAuthUser();
    const isEnabled = useUiFlag('logRocketEnabled');
    const appId = uiConfig?.logRocketAppId;
    const clientId = uiConfig?.unleashContext?.properties?.clientId;
    const userId = user?.id;
    const isEnterprisePayg =
        isEnterprise() && uiConfig?.billing === 'pay-as-you-go';

    const started = useRef(false);

    useEffect(() => {
        if (started.current) return;
        if (!isEnabled || !appId || !isEnterprisePayg) return;
        if (!userId || !clientId) return;

        started.current = true;
        import('logrocket')
            .then(({ default: LogRocket }) => {
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
            })
            .catch((error) => {
                started.current = false;
                console.warn(error);
            });
    }, [isEnabled, appId, isEnterprisePayg, userId, clientId]);

    return <>{children}</>;
};
