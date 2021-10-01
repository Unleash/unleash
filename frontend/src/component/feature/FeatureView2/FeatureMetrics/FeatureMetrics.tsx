import { useParams } from 'react-router';
import useFeature from '../../../../hooks/api/getters/useFeature/useFeature';
import MetricComponent from '../../view/metric-container';
import { useStyles } from './FeatureMetrics.styles';
import { IFeatureViewParams } from '../../../../interfaces/params';

const FeatureMetrics = () => {
    const styles = useStyles();
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const { feature } = useFeature(projectId, featureId);

    return (
        <div className={styles.container}>
            <MetricComponent featureToggle={feature} />
        </div>
    );
};

export default FeatureMetrics;
