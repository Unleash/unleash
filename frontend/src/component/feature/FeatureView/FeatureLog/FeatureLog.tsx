import { useParams } from 'react-router';
import { useFeature } from '../../../../hooks/api/getters/useFeature/useFeature';
import { useStyles } from './FeatureLog.styles';
import { IFeatureViewParams } from '../../../../interfaces/params';
import { FeatureEventHistory } from '../../../history/FeatureEventHistory/FeatureEventHistory';

const FeatureLog = () => {
    const styles = useStyles();
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const { feature } = useFeature(projectId, featureId);

    if (!feature.name) {
        return null;
    }

    return (
        <div className={styles.container}>
            <FeatureEventHistory toggleName={feature.name} />
        </div>
    );
};

export default FeatureLog;
