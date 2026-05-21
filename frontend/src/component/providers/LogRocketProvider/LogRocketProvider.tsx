import type React from 'react';
import { type FC, lazy, Suspense, useState } from 'react';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useUiFlag } from 'hooks/useUiFlag';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';
import { isTrialInstance } from 'utils/instanceTrial';
import {
    LogRocketContext,
    type LogRocketInstance,
} from 'contexts/LogRocketContext';

const LogRocketRunner = lazy(() => import('./LogRocketRunner.tsx'));

export const LogRocketProvider: FC<{ children?: React.ReactNode }> = ({
    children,
}) => {
    const { uiConfig, isEnterprise } = useUiConfig();
    const { user } = useAuthUser();
    const { instanceStatus } = useInstanceStatus();
    const isEnabled = useUiFlag('logRocketEnabled');
    const appId = uiConfig?.logRocketAppId;
    const clientId = uiConfig?.unleashContext?.properties?.clientId;
    const userId = user?.id;
    const isEnterprisePayg =
        isEnterprise() && uiConfig?.billing === 'pay-as-you-go';
    const isTrial = isTrialInstance(instanceStatus);
    const [logRocketInstance, setLogRocketInstance] =
        useState<LogRocketInstance | null>(null);

    const shouldLoad =
        isEnabled && isEnterprisePayg && isTrial && appId && clientId && userId;

    return (
        <LogRocketContext.Provider value={logRocketInstance}>
            {shouldLoad ? (
                <Suspense fallback={null}>
                    <LogRocketRunner
                        appId={appId}
                        clientId={clientId}
                        userId={userId}
                        onReady={setLogRocketInstance}
                    />
                </Suspense>
            ) : null}
            {children}
        </LogRocketContext.Provider>
    );
};
