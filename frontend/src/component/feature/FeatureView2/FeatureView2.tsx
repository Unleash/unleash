import { useParams } from 'react-router-dom';
import useFeature from '../../../hooks/api/getters/useFeature/useFeature';
import FeatureViewEnvironment from './FeatureViewEnvironment/FeatureViewEnvironment';
import FeatureViewMetaData from './FeatureViewMetaData/FeatureViewMetaData';

const FeatureView2 = () => {
    const { projectId, featureId } = useParams();
    const { feature } = useFeature(projectId, featureId);

    return (
        <div style={{ display: 'flex', width: '100%' }}>
            <FeatureViewMetaData />
            {feature.environments.map(env => {
                return <FeatureViewEnvironment env={env} key={env.name} />;
            })}
        </div>
    );
};

export default FeatureView2;
