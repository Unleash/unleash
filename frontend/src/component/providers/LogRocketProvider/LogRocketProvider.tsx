import type React from 'react';
import { type FC, useEffect, useRef } from 'react';
import LogRocket from 'logrocket';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useUiFlag } from 'hooks/useUiFlag';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';

export const LogRocketProvider: FC<{ children?: React.ReactNode }> = ({
    children,
}) => {
    const { uiConfig } = useUiConfig();
    const { user } = useAuthUser();
    const isEnabled = useUiFlag('logRocketEnabled');
    const appId = uiConfig?.logRocketAppId;
    const clientId = uiConfig?.unleashContext?.properties?.clientId;
    const userId = user?.id;

    const initialized = useRef(false);
    const identified = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        if (!isEnabled || !appId) return;

        try {
            LogRocket.init(appId);
            initialized.current = true;
        } catch (error) {
            console.warn(error);
        }
    }, [isEnabled, appId]);

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
