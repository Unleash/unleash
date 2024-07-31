import { EventLog } from 'component/events/EventLog/EventLog';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';

export const ProjectLog = () => {
    const projectId = useRequiredPathParam('projectId');

    return <EventLog title='Event Log' project={projectId} />;
};
