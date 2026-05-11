import { useState } from 'react';
import { ConnectSdkDialog } from 'component/onboarding/dialog/ConnectSdkDialog';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { FeatureFlagSetupBannerCard } from './FeatureFlagSetupBannerCard.tsx';

interface FeatureConnectSdkBannerProps {
    projectId: string;
    featureId: string;
}

export const FeatureConnectSdkBanner = ({
    projectId,
    featureId,
}: FeatureConnectSdkBannerProps) => {
    const { project } = useProjectOverview(projectId);
    const { trackEvent } = usePlausibleTracker();
    const [connectSdkOpen, setConnectSdkOpen] = useState(false);

    if (project.onboardingStatus.status === 'onboarded') {
        return null;
    }

    const environments =
        project.environments?.map((env) => env.environment) ?? [];

    const onConnectSdkClick = () => {
        trackEvent('onboarding', {
            props: { eventType: 'flag-connect-sdk-clicked' },
        });
        setConnectSdkOpen(true);
    };

    return (
        <>
            <FeatureFlagSetupBannerCard
                title='Connect SDK'
                description='You must connect an SDK to the project before you can implement this flag in your code.'
                buttonLabel='Connect SDK'
                onButtonClick={onConnectSdkClick}
            />
            <ConnectSdkDialog
                open={connectSdkOpen}
                onClose={() => setConnectSdkOpen(false)}
                onFinish={() => setConnectSdkOpen(false)}
                project={projectId}
                environments={environments}
                feature={featureId}
            />
        </>
    );
};
