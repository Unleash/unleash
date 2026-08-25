import { type FC, lazy, Suspense } from 'react';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { useUiFlag } from 'hooks/useUiFlag';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';
import { isTrialInstance } from 'utils/instanceTrial';

const HubSpotChatRunner = lazy(() => import('./HubSpotChatRunner.tsx'));

const HUBSPOT_DEV_OVERRIDE =
    import.meta.env.DEV && import.meta.env.MODE !== 'test';

export const HubSpotChatLoader: FC = () => {
    const { uiConfig, isEnterprise } = useUiConfig();
    const { user } = useAuthUser();
    const { instanceStatus } = useInstanceStatus();
    const isEnabled = useUiFlag('hubspotChatEnabled');
    const portalId = uiConfig?.hubspotPortalId;
    const isEnterprisePayg =
        isEnterprise() && uiConfig?.billing === 'pay-as-you-go';
    const isTrial = isTrialInstance(instanceStatus);

    const shouldLoad =
        isEnabled &&
        isEnterprisePayg &&
        (isTrial || HUBSPOT_DEV_OVERRIDE) &&
        portalId &&
        user?.id;

    if (!shouldLoad) {
        return null;
    }

    return (
        <Suspense fallback={null}>
            <HubSpotChatRunner
                portalId={portalId}
                email={user.email}
                userId={user.id}
                userName={user.name}
                instanceId={uiConfig?.unleashContext?.properties?.clientId}
                billing={uiConfig?.billing}
                trialExpiry={instanceStatus?.trialExpiry}
            />
        </Suspense>
    );
};
