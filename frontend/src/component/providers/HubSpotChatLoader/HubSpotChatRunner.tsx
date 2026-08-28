import { useEffect } from 'react';

type Props = {
    portalId: string;
    email: string;
    userId: number;
    userName?: string;
    instanceId?: string;
    billing?: string;
    trialExpiry?: string;
};

type HubSpotWindow = Window & {
    _hsq?: unknown[][];
};

export const buildIdentity = (props: Omit<Props, 'portalId'>) => ({
    id: `${props.instanceId ?? 'unknown'}:${props.userId}`,
    email: props.email,
    name: props.userName,
    unleash_unverified_email: props.email,
    unleash_instance_id: props.instanceId,
    unleash_instance_url: window.location.origin,
    unleash_billing: props.billing,
    unleash_trial_expiry: props.trialExpiry,
});

const SCRIPT_ID = 'hs-script-loader';

const HubSpotChatRunner = ({
    portalId,
    email,
    userId,
    userName,
    instanceId,
    billing,
    trialExpiry,
}: Props) => {
    useEffect(() => {
        try {
            const w = window as HubSpotWindow;
            w._hsq = w._hsq || [];
            const hsq = w._hsq;
            hsq.push(['doNotTrack']);
            hsq.push([
                'identify',
                buildIdentity({
                    email,
                    userId,
                    userName,
                    instanceId,
                    billing,
                    trialExpiry,
                }),
            ]);
            hsq.push(['trackPageView']);

            if (document.getElementById(SCRIPT_ID)) {
                return;
            }
            const script = document.createElement('script');
            script.id = SCRIPT_ID;
            script.src = `//js.hs-scripts.com/${portalId}.js`;
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);
        } catch (error) {
            console.warn(error);
        }
    }, [portalId, email, userId, userName, instanceId, billing, trialExpiry]);

    return null;
};

export default HubSpotChatRunner;
