import EventLog from '../EventLog';
import { useEvents } from '../../../hooks/api/getters/useEvents/useEvents';

export const EventHistory = () => {
    const { events } = useEvents();

    if (events.length < 0) {
        return null;
    }

    return <EventLog history={events} title="Recent changes" />;
};
