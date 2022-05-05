import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { useStyles } from './FeatureLog.styles';
import { FeatureEventHistory } from 'component/history/FeatureEventHistory/FeatureEventHistory';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';

const FeatureLog = () => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { classes: styles } = useStyles();
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
