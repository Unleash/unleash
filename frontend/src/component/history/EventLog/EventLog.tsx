import { List, Switch, FormControlLabel } from '@mui/material';
import EventJson from 'component/history/EventLog/EventJson/EventJson';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import EventCard from 'component/history/EventLog/EventCard/EventCard';
import { useStyles } from './EventLog.styles';
import { formatDateYMDHMS } from 'utils/formatDate';
import { IEventSettings } from 'hooks/useEventSettings';
import { IEvent } from 'interfaces/event';
import React from 'react';
import { ILocationSettings } from 'hooks/useLocationSettings';

interface IEventLogProps {
    title: string;
    events: IEvent[];
    eventSettings: IEventSettings;
    setEventSettings: React.Dispatch<React.SetStateAction<IEventSettings>>;
    locationSettings: ILocationSettings;
    displayInline?: boolean;
}

const EventLog = ({
    title,
    events,
    eventSettings,
    setEventSettings,
    locationSettings,
    displayInline,
}: IEventLogProps) => {
    const { classes: styles } = useStyles();
    const toggleShowDiff = () => {
        setEventSettings({ showData: !eventSettings.showData });
    };
    const formatFulldateTime = (v: string) => {
        return formatDateYMDHMS(v, locationSettings.locale);
    };

    if (!events || events.length < 0) {
        return null;
    }

    let entries;

    const renderListItemCards = (entry: IEvent) => (
        <li key={entry.id} className={styles.eventEntry}>
            <EventCard
                entry={entry}
                timeFormatted={formatFulldateTime(entry.createdAt)}
            />
        </li>
    );

    if (eventSettings.showData) {
        entries = events.map(entry => (
            <EventJson key={`log${entry.id}`} entry={entry} />
        ));
    } else {
        entries = events.map(renderListItemCards);
    }

    return (
        <PageContent
            disablePadding={displayInline}
            disableBorder={displayInline}
            header={
                <PageHeader
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

export default EventLog;
