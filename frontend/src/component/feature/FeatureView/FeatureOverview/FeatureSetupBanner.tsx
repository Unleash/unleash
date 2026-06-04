import { getFlagSetupStage } from './getFlagSetupStage.ts';
import { FeatureConnectSdkBanner } from './FeatureConnectSdkBanner.tsx';
import { FeatureImplementFlagBanner } from './FeatureImplementFlagBanner.tsx';
import { FeatureAddStrategyBanner } from './FeatureAddStrategyBanner.tsx';
import type { FeatureSchema, ProjectOverviewSchema } from 'openapi/index.ts';

interface FeatureSetupBannerProps {
    projectId: string;
    project: ProjectOverviewSchema;
    feature: FeatureSchema & { id: string };
    onComplete: () => void;
}

export const FeatureSetupBanner = ({
    projectId,
    project,
    feature,
    onComplete,
}: FeatureSetupBannerProps) => {
    const stage = getFlagSetupStage(project.onboardingStatus, feature);

    switch (stage) {
        case 'connect-sdk':
            return (
                <FeatureConnectSdkBanner
                    projectId={projectId}
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
                    projectId={projectId}
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
