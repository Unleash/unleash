import type { ComponentProps, FC } from 'react';
import { useUiFlag } from 'hooks/useUiFlag';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { FeatureOverviewEnvironment } from './FeatureOverviewEnvironment/FeatureOverviewEnvironment';
import LegacyFeatureOverviewEnvironment from './FeatureOverviewEnvironment/LegacyFeatureOverviewEnvironment';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useFeatureMetrics from 'hooks/api/getters/useFeatureMetrics/useFeatureMetrics';
import { getFeatureMetrics } from 'utils/getFeatureMetrics';
import { useReleasePlans } from 'hooks/api/getters/useReleasePlans/useReleasePlans';

type FeatureOverviewEnvironmentsProps = {
    hiddenEnvironments?: string[];
};

const FeatureOverviewWithReleasePlans: FC<
    ComponentProps<typeof FeatureOverviewEnvironment>
> = ({ environment, ...props }) => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { releasePlans } = useReleasePlans(
        projectId,
        featureId,
        environment?.name,
    );

    return (
        <FeatureOverviewEnvironment
            {...props}
            environment={{ ...environment, releasePlans }}
        />
    );
};

export const FeatureOverviewEnvironments: FC<
    FeatureOverviewEnvironmentsProps
> = ({ hiddenEnvironments = [] }) => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { feature } = useFeature(projectId, featureId);
    const { metrics } = useFeatureMetrics(projectId, featureId);
    const featureMetrics = getFeatureMetrics(feature?.environments, metrics);
    const flagOverviewRedesign = useUiFlag('flagOverviewRedesign');

    if (!feature) return null;

    if (!flagOverviewRedesign) {
        return (
            <>
                {feature.environments?.map((env) => (
                    <LegacyFeatureOverviewEnvironment
                        env={env}
                        key={env.name}
                    />
                ))}
            </>
        );
    }

    return feature.environments
        ?.filter((env) => !hiddenEnvironments.includes(env.name))
        .map((env) => (
            <FeatureOverviewWithReleasePlans
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
