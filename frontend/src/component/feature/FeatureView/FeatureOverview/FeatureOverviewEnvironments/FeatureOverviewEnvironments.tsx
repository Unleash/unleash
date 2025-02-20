import type { FC } from 'react';
import { useUiFlag } from 'hooks/useUiFlag';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { FeatureOverviewEnvironment } from './FeatureOverviewEnvironment/FeatureOverviewEnvironment';
import LegacyFeatureOverviewEnvironment from './FeatureOverviewEnvironment/LegacyFeatureOverviewEnvironment';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';

type FeatureOverviewEnvironmentsProps = {
    hiddenEnvironments?: string[];
};

export const FeatureOverviewEnvironments: FC<
    FeatureOverviewEnvironmentsProps
> = ({ hiddenEnvironments = [] }) => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { feature } = useFeature(projectId, featureId);
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
        .map((env) => <FeatureOverviewEnvironment env={env} key={env.name} />);
};
