import { List, Switch, FormControlLabel } from '@material-ui/core';
import PropTypes from 'prop-types';
import EventJson from './EventJson/EventJson';
import PageContent from 'component/common/PageContent/PageContent';
import HeaderTitle from 'component/common/HeaderTitle';
import EventCard from './EventCard/EventCard';
import { useStyles } from './EventLog.styles.js';
import { formatDateYMDHMS } from 'utils/formatDate';

const EventLog = ({
    title,
    history,
    eventSettings,
    setEventSettings,
    locationSettings,
    displayInline,
}) => {
    const styles = useStyles();
    const toggleShowDiff = () => {
        setEventSettings({ showData: !eventSettings.showData });
    };
    const formatFulldateTime = v => {
        return formatDateYMDHMS(v, locationSettings.locale);
    };

    if (!history || history.length < 0) {
        return null;
    }

    let entries;

    const renderListItemCards = entry => (
        <div key={entry.id} className={styles.eventEntry}>
            <EventCard
                entry={entry}
                timeFormatted={formatFulldateTime(entry.createdAt)}
            />
        </div>
    );

    if (eventSettings.showData) {
        entries = history.map(entry => (
            <EventJson key={`log${entry.id}`} entry={entry} />
        ));
    } else {
        entries = history.map(renderListItemCards);
    }

    return (
        <PageContent
            disablePadding={displayInline}
            disableBorder={displayInline}
            headerContent={
                <HeaderTitle
                    title={title}
                    actions={
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={eventSettings.showData}
                                    onChange={toggleShowDiff}
                                    color="primary"
                                />
                            }
                            label="Full events"
                        />
                    }
                />
            }
        >
            <div className={styles.history}>
                <List>{entries}</List>
            </div>
        </PageContent>
    );
};

EventLog.propTypes = {
    history: PropTypes.array,
    eventSettings: PropTypes.object.isRequired,
    setEventSettings: PropTypes.func.isRequired,
    locationSettings: PropTypes.object.isRequired,
    title: PropTypes.string,
    displayInline: PropTypes.bool,
};

export default EventLog;
