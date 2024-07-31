import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { EventLog } from 'component/events/EventLog/EventLog';

const FeatureLog = () => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { feature } = useFeature(projectId, featureId);

    if (!feature.name) {
        return null;
    }

    return <EventLog title='Event log' feature={featureId} />;
};

export default FeatureLog;
