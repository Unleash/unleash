import { List, Switch, FormControlLabel } from '@material-ui/core';
import PropTypes from 'prop-types';

import { formatFullDateTimeWithLocale } from '../../common/util';

import EventJson from './EventJson/EventJson';
import PageContent from '../../common/PageContent/PageContent';
import HeaderTitle from '../../common/HeaderTitle';
import EventCard from './EventCard/EventCard';

import { useStyles } from './EventLog.styles.js';

const EventLog = ({
    updateSetting,
    title,
    history,
    settings,
    displayInline,
    location,
    hideName,
}) => {
    const styles = useStyles();
    const toggleShowDiff = () => {
        updateSetting('showData', !settings.showData);
    };
    const formatFulldateTime = v => {
        return formatFullDateTimeWithLocale(v, location.locale);
    };

    const showData = settings.showData;

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

    if (showData) {
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
                                    checked={showData}
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
    updateSettings: PropTypes.func,
    title: PropTypes.string,
    settings: PropTypes.object,
    displayInline: PropTypes.bool,
    location: PropTypes.object,
    hideName: PropTypes.bool,
};

export default EventLog;
