import { getFeatureSetupStage } from './getFeatureSetupStage.ts';
import { FeatureConnectSdkBanner } from './FeatureConnectSdkBanner.tsx';
import { FeatureImplementFlagBanner } from './FeatureImplementFlagBanner.tsx';
import { FeatureAddStrategyBanner } from './FeatureAddStrategyBanner.tsx';
import type { FeatureSchema, ProjectOverviewSchema } from 'openapi/index.ts';

interface FeatureSetupBannerProps {
    project: ProjectOverviewSchema & { id: string };
    feature: FeatureSchema & { id: string };
    onComplete: () => void;
}

export const FeatureSetupBanner = ({
    project,
    feature,
    onComplete,
}: FeatureSetupBannerProps) => {
    const stage = getFeatureSetupStage({
        projectOnboardingStatus: project.onboardingStatus.status,
        feature,
    });

    switch (stage) {
        case 'connect-sdk':
            return (
                <FeatureConnectSdkBanner
                    projectId={project.id}
                    featureId={feature.id}
                    environments={
                        project.environments?.map((env) => env.environment) ??
                        []
                    }
                    onComplete={onComplete}
                />
            );
        case 'implement-flag':
            return (
                <FeatureImplementFlagBanner
                    projectId={project.id}
                    featureId={feature.id}
                    onComplete={onComplete}
                />
            );
        case 'add-strategy':
            return <FeatureAddStrategyBanner />;
        default:
            return null;
    }
};
