import EventLog from './EventLog';
import { useEventSettings } from 'hooks/useEventSettings';
import { useLocationSettings } from 'hooks/useLocationSettings';

interface IEventLogContainerProps {
    title: string;
    history: unknown[];
    displayInline?: boolean;
}

const EventLogContainer = (props: IEventLogContainerProps) => {
    const { locationSettings } = useLocationSettings();
    const { eventSettings, setEventSettings } = useEventSettings();

    return (
        <EventLog
            title={props.title}
            history={props.history}
            eventSettings={eventSettings}
            setEventSettings={setEventSettings}
            locationSettings={locationSettings}
            displayInline={props.displayInline}
        />
    );
};

export default EventLogContainer;
