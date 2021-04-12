import EventDiff from './EventDiff/EventDiff';

import { useStyles } from './EventCard.styles';

const EventCard = ({ entry, timeFormatted }) => {
    const styles = useStyles();

    const getName = name => {
        if (name) {
            return (
                <>
                    <dt className={styles.eventLogHeader}>Name: </dt>
                    <dd>{name}</dd>
                </>
            );
        } else {
            return null;
        }
    };

    return (
        <div>
            <dl>
                <dt className={styles.eventLogHeader}>Changed at:</dt>
                <dd>{timeFormatted}</dd>
                <dt className={styles.eventLogHeader}>Changed by: </dt>
                <dd title={entry.createdBy}>{entry.createdBy}</dd>
                <dt className={styles.eventLogHeader}>Type: </dt>
                <dd>{entry.type}</dd>
                {getName(entry.data.name)}
            </dl>
            <strong>Change</strong>
            <EventDiff entry={entry} />
        </div>
    );
};

export default EventCard;
