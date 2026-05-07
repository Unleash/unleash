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
    const initialized = useRef(false);
    const identified = useRef(false);

    const appId = uiConfig?.logRocketAppId;
    const instanceId = uiConfig?.versionInfo?.instanceId;

    useEffect(() => {
        if (!isEnabled || !appId || initialized.current) return;
        try {
            LogRocket.init(appId);
            initialized.current = true;
        } catch (error) {
            console.warn(error);
        }
    }, [isEnabled, appId]);

    useEffect(() => {
        if (
            !initialized.current ||
            identified.current ||
            !user?.id ||
            !instanceId
        ) {
            return;
        }
        try {
            LogRocket.identify(`${instanceId}:${user.id}`, {
                instanceId,
                userId: String(user.id),
            });
            identified.current = true;
        } catch (error) {
            console.warn(error);
        }
    }, [user?.id, instanceId]);

    return <>{children}</>;
};
