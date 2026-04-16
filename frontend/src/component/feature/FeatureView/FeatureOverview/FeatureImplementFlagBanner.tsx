import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import useFeatureMetrics from 'hooks/api/getters/useFeatureMetrics/useFeatureMetrics';
import { FeatureFlagSetupBannerCard } from './FeatureFlagSetupBannerCard.tsx';

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

    if (project.onboardingStatus.status !== 'onboarded') {
        return null;
    }

    if (loading || metrics.seenApplications.length > 0) {
        return null;
    }

    return (
        <FeatureFlagSetupBannerCard
            title='Implement your flag'
            description='Waiting for flag evaluations. Wrap your feature logic in a flag evaluation to get set up.'
            buttonLabel='Wrap your code'
            onButtonClick={() => {}}
        />
    );
};
