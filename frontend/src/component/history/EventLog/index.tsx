import EventLog from 'component/history/EventLog/EventLog';
import { useEventSettings } from 'hooks/useEventSettings';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { IEvent } from 'interfaces/event';

interface IEventLogContainerProps {
    title: string;
    events: IEvent[];
    displayInline?: boolean;
}

const EventLogContainer = (props: IEventLogContainerProps) => {
    const { locationSettings } = useLocationSettings();
    const { eventSettings, setEventSettings } = useEventSettings();

    return (
        <EventLog
            title={props.title}
            events={props.events}
            eventSettings={eventSettings}
            setEventSettings={setEventSettings}
            locationSettings={locationSettings}
            displayInline={props.displayInline}
        />
    );
};

export default EventLogContainer;
