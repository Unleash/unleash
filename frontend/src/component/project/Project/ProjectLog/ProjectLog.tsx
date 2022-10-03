import { EventLog } from 'component/events/EventLog/EventLog';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useStyles } from './ProjectLog.styles';

const ProjectLog = () => {
    const projectId = useRequiredPathParam('projectId');

    const { classes: styles } = useStyles();

    return (
        <div className={styles.container}>
            <EventLog
                title="Event Log"
                project={projectId}
                feature={'test'}
                displayInline
            ></EventLog>
        </div>
    );
};

export default ProjectLog;
