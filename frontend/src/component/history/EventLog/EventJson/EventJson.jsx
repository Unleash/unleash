import PropTypes from 'prop-types';

import { useStyles } from './EventJson.styles';

const EventJson = ({ entry }) => {
    const { classes: styles } = useStyles();

    const localEventData = JSON.parse(JSON.stringify(entry));
    delete localEventData.description;
    delete localEventData.name;
    delete localEventData.diffs;

    const prettyPrinted = JSON.stringify(localEventData, null, 2);

    return (
        <li className={styles.historyItem}>
            <div>
                <code className="JSON smalltext man">{prettyPrinted}</code>
            </div>
        </li>
    );
};

EventJson.propTypes = {
    entry: PropTypes.object,
};

export default EventJson;
