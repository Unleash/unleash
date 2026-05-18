import { useState } from 'react';
import { Button } from '@mui/material';
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
    const { project, refetch } = useProjectOverview(projectId);
    const { feature, loading, refetchFeature } = useFeature(
        projectId,
        featureId,
    );
    const { trackEvent } = usePlausibleTracker();
    const [dialogOpen, setDialogOpen] = useState(false);

    const isOnboarded =
        project.onboardingStatus.status === 'onboarded' ||
        project.onboardingStatus.status === 'sdk-connected';
    const isInitialStage =
        !loading &&
        (!feature.lifecycle || feature.lifecycle.stage === 'initial');
    const showBanner = isOnboarded && isInitialStage;

    const onImplementClick = () => {
        trackEvent('onboarding', {
            props: { eventType: 'flag-implement-clicked' },
        });
        setDialogOpen(true);
    };

    const onDialogClose = () => {
        setDialogOpen(false);
        refetch();
        refetchFeature();
    };

    return (
        <>
            {showBanner && (
                <FeatureFlagSetupBannerCard
                    title='Implement your flag'
                    description='Waiting for flag evaluations. Wrap your feature logic in a flag evaluation to get set up.'
                >
                    <Button variant='contained' onClick={onImplementClick}>
                        Wrap your code
                    </Button>
                </FeatureFlagSetupBannerCard>
            )}
            <ImplementFlagDialog
                open={dialogOpen}
                onClose={onDialogClose}
                projectId={projectId}
                feature={featureId}
            />
        </>
    );
};
