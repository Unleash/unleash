import { useParams } from 'react-router';
import useFeature from '../../../../hooks/api/getters/useFeature/useFeature';
import { useStyles } from './FeatureLog.styles';
import { IFeatureViewParams } from '../../../../interfaces/params';
import HistoryComponent from '../../../history/FeatureEventHistory';

const FeatureLog = () => {
    const styles = useStyles();
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const { feature } = useFeature(projectId, featureId);

    return (
        <div className={styles.container}>
            <HistoryComponent toggleName={feature.name} />;
        </div>
    );
};

export default FeatureLog;
