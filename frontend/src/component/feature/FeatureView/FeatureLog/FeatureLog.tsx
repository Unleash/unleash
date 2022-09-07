import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { useStyles } from './FeatureLog.styles';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { EventLog } from 'component/events/EventLog/EventLog';

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
            <EventLog
                title="Event log"
                project={projectId}
                feature={featureId}
                displayInline
            />
        </div>
    );
};

export default FeatureLog;
