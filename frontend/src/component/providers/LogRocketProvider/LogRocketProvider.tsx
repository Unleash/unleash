import type React from 'react';
import { type FC, useEffect, useRef } from 'react';
import LogRocket from 'logrocket';
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

    const initialized = useRef(false);
    const identified = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        if (!isEnabled || !appId || !isEnterprisePayg) return;

        try {
            LogRocket.init(appId, {
                dom: {
                    textSanitizer: true,
                    inputSanitizer: 'lipsum',
                },
            });
            initialized.current = true;
        } catch (error) {
            console.warn(error);
        }
    }, [isEnabled, appId, isEnterprisePayg]);

    useEffect(() => {
        if (identified.current) return;
        if (!initialized.current) return;
        if (!userId || !clientId) return;

        try {
            LogRocket.identify(`${clientId}:${userId}`, {
                clientId,
                userId: String(userId),
            });
            identified.current = true;
        } catch (error) {
            console.warn(error);
        }
    }, [userId, clientId]);

    return <>{children}</>;
};
