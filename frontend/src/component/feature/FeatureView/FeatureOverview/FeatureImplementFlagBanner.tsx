import { useState } from 'react';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import useFeatureMetrics from 'hooks/api/getters/useFeatureMetrics/useFeatureMetrics';
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
    const { metrics, loading } = useFeatureMetrics(projectId, featureId);
    const [dialogOpen, setDialogOpen] = useState(false);

    const isOnboarded = project.onboardingStatus.status === 'onboarded';
    const hasNoMetrics = !loading && metrics.seenApplications.length === 0;
    const showBanner = isOnboarded && hasNoMetrics;

    if (!showBanner && !dialogOpen) {
        return null;
    }

    return (
        <>
            {showBanner && (
                <FeatureFlagSetupBannerCard
                    title='Implement your flag'
                    description='Waiting for flag evaluations. Wrap your feature logic in a flag evaluation to get set up.'
                    buttonLabel='Wrap your code'
                    onButtonClick={() => setDialogOpen(true)}
                />
            )}
            <ImplementFlagDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                feature={featureId}
            />
        </>
    );
};
