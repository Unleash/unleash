import PropTypes from 'prop-types';
import { useStyles } from './EventJson.styles';
import { IEvent } from 'interfaces/event';

interface IEventJsonProps {
    entry: IEvent;
}

const EventJson = ({ entry }: IEventJsonProps) => {
    const { classes: styles } = useStyles();

    const localEventData = JSON.parse(JSON.stringify(entry));
    delete localEventData.description;
    delete localEventData.name;
    delete localEventData.diffs;

    const prettyPrinted = JSON.stringify(localEventData, null, 2);

    return (
        <li className={styles.historyItem}>
            <div>
                <code>{prettyPrinted}</code>
            </div>
        </li>
    );
};

EventJson.propTypes = {
    entry: PropTypes.object,
};

export default EventJson;
