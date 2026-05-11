import { useState } from 'react';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { FeatureFlagSetupBannerCard } from './FeatureFlagSetupBannerCard.tsx';
import { ImplementFlagDialog } from './ImplementFlagDialog/ImplementFlagDialog.tsx';

interface FeatureImplementFlagBannerProps {
    projectId: string;
    featureId: string;
}

export const FeatureImplementFlagBanner = ({
    projectId,
    featureId,
}: FeatureImplementFlagBannerProps) => {
    const { project } = useProjectOverview(projectId);
    const { feature, loading } = useFeature(projectId, featureId);
    const { trackEvent } = usePlausibleTracker();
    const [dialogOpen, setDialogOpen] = useState(false);

    const isOnboarded = project.onboardingStatus.status === 'onboarded';
    const isInitialStage = !loading && feature.lifecycle?.stage === 'initial';
    const showBanner = isOnboarded && isInitialStage;

    if (!showBanner && !dialogOpen) {
        return null;
    }

    const onImplementClick = () => {
        trackEvent('onboarding', {
            props: { eventType: 'flag-implement-clicked' },
        });
        setDialogOpen(true);
    };

    return (
        <>
            {showBanner && (
                <FeatureFlagSetupBannerCard
                    title='Implement your flag'
                    description='Waiting for flag evaluations. Wrap your feature logic in a flag evaluation to get set up.'
                    buttonLabel='Wrap your code'
                    onButtonClick={onImplementClick}
                />
            )}
            <ImplementFlagDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                projectId={projectId}
                feature={featureId}
            />
        </>
    );
};
