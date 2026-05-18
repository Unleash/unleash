import { useState } from 'react';
import { ConnectSdkDialog } from 'component/onboarding/dialog/ConnectSdkDialog';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { FeatureFlagSetupBannerCard } from './FeatureFlagSetupBannerCard.tsx';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import {
    UPDATE_PROJECT,
    CREATE_PROJECT_API_TOKEN,
} from 'component/providers/AccessProvider/permissions';

interface FeatureConnectSdkBannerProps {
    projectId: string;
    featureId: string;
}

export const FeatureConnectSdkBanner = ({
    projectId,
    featureId,
}: FeatureConnectSdkBannerProps) => {
    const { project, refetch } = useProjectOverview(projectId);
    const { trackEvent } = usePlausibleTracker();
    const [connectSdkOpen, setConnectSdkOpen] = useState(false);

    const environments =
        project.environments?.map((env) => env.environment) ?? [];

    const onConnectSdkClick = () => {
        trackEvent('onboarding', {
            props: { eventType: 'flag-connect-sdk-clicked' },
        });
        setConnectSdkOpen(true);
    };

    const shouldShowBanner =
        project.onboardingStatus.status !== 'onboarded' &&
        project.onboardingStatus.status !== 'sdk-connected';

    const onDialogClose = () => {
        setConnectSdkOpen(false);
        refetch();
    };

    return (
        <>
            {shouldShowBanner && (
                <FeatureFlagSetupBannerCard
                    title='Connect SDK'
                    description='You must connect an SDK to the project before you can implement this flag in your code.'
                >
                    <PermissionButton
                        variant='contained'
                        onClick={onConnectSdkClick}
                        permission={[UPDATE_PROJECT, CREATE_PROJECT_API_TOKEN]}
                        projectId={projectId}
                        sx={{ alignSelf: 'auto' }}
                    >
                        Connect SDK
                    </PermissionButton>
                </FeatureFlagSetupBannerCard>
            )}
            <ConnectSdkDialog
                open={connectSdkOpen}
                onClose={onDialogClose}
                onFinish={onDialogClose}
                project={projectId}
                environments={environments}
                feature={featureId}
            />
        </>
    );
};
