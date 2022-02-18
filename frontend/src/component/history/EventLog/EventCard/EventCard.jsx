import EventDiff from './EventDiff/EventDiff';

import { useStyles } from './EventCard.styles';
import ConditionallyRender from '../../../common/ConditionallyRender';

const EventCard = ({ entry, timeFormatted }) => {
    const styles = useStyles();

    return (
        <div>
            <dl>
                <dt className={styles.eventLogHeader}>Event id: </dt>
                <dd>{entry.id}</dd>
                <dt className={styles.eventLogHeader}>Changed at:</dt>
                <dd>{timeFormatted}</dd>
                <dt className={styles.eventLogHeader}>Event: </dt>
                <dd>{entry.type}</dd>
                <dt className={styles.eventLogHeader}>Changed by: </dt>
                <dd title={entry.createdBy}>{entry.createdBy}</dd>
                <ConditionallyRender
                    condition={entry.project}
                    show={
                        <>
                            <dt className={styles.eventLogHeader}>Project: </dt>
                            <dd>{entry.project}</dd>
                        </>
                    }
                />
                <ConditionallyRender
                    condition={entry.featureName}
                    show={
                        <>
                            <dt className={styles.eventLogHeader}>Feature: </dt>
                            <dd>{entry.featureName}</dd>
                        </>
                    }
                />
            </dl>
            <ConditionallyRender
                condition={entry.data || entry.preData}
                show={
                    <>
                        <strong>Change</strong>
                        <EventDiff entry={entry} />
                    </>
                }
            />
        </div>
    );
};

export default EventCard;
