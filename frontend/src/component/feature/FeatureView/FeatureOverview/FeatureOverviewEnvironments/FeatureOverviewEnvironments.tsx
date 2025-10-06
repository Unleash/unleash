import type { ComponentProps, FC } from 'react';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { LegacyFeatureOverviewEnvironment } from './FeatureOverviewEnvironment/LegacyFeatureOverviewEnvironment/LegacyFeatureOverviewEnvironment.tsx';
import { FeatureOverviewEnvironment } from './FeatureOverviewEnvironment/FeatureOverviewEnvironment.tsx';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useFeatureMetrics from 'hooks/api/getters/useFeatureMetrics/useFeatureMetrics';
import { getFeatureMetrics } from 'utils/getFeatureMetrics';
import { useReleasePlans } from 'hooks/api/getters/useReleasePlans/useReleasePlans';
import { useUiFlag } from 'hooks/useUiFlag';

type FeatureOverviewEnvironmentsProps = {
    hiddenEnvironments?: string[];
    onToggleEnvOpen?: (isOpen: boolean) => void;
};

const FeatureOverviewWithReleasePlans: FC<
    ComponentProps<typeof LegacyFeatureOverviewEnvironment>
> = ({ environment, ...props }) => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { releasePlans } = useReleasePlans(
        projectId,
        featureId,
        environment?.name,
    );
    const envAddStrategySuggestionEnabled = useUiFlag(
        'envAddStrategySuggestion',
    );
    if (envAddStrategySuggestionEnabled) {
        return (
            <FeatureOverviewEnvironment
                {...props}
                environment={{ ...environment, releasePlans }}
            />
        );
    }

    return (
        <LegacyFeatureOverviewEnvironment
            {...props}
            environment={{ ...environment, releasePlans }}
        />
    );
};

export const FeatureOverviewEnvironments: FC<
    FeatureOverviewEnvironmentsProps
> = ({ hiddenEnvironments = [], onToggleEnvOpen }) => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { feature } = useFeature(projectId, featureId);
    const { metrics } = useFeatureMetrics(projectId, featureId);
    const featureMetrics = getFeatureMetrics(feature?.environments, metrics);

    if (!feature) return null;

    return feature.environments
        ?.filter((env) => !hiddenEnvironments.includes(env.name))
        .map((env) => (
            <FeatureOverviewWithReleasePlans
                onToggleEnvOpen={onToggleEnvOpen}
                environment={env}
                key={env.name}
                metrics={featureMetrics.find(
                    (featureMetric) => featureMetric.environment === env?.name,
                )}
                otherEnvironments={
                    feature.environments
                        ?.map((e) => e.name)
                        .filter(
                            (name) =>
                                name !== env.name &&
                                !hiddenEnvironments.includes(name),
                        ) || []
                }
            />
        ));
};
