import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import FeatureOverviewEnvironment from './FeatureOverviewEnvironment/FeatureOverviewEnvironment';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';

const FeatureOverviewEnvironments = () => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { feature } = useFeature(projectId, featureId);

    if (!feature) return null;

    const { environments } = feature;

    const renderEnvironments = () => {
        return environments?.map(env => {
            return <FeatureOverviewEnvironment env={env} key={env.name} />;
        });
    };

    return <>{renderEnvironments()}</>;
};

export default FeatureOverviewEnvironments;
