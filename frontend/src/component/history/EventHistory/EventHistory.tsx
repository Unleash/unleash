import { useEffect } from 'react';

import EventLog from '../EventLog';

interface IEventLogProps {
    fetchHistory: () => void;
    history: History;
}

const EventHistory = ({ fetchHistory, history }: IEventLogProps) => {
    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    if (history.length < 0) {
        return null;
    }

    return <EventLog history={history} title="Recent changes" />;
};

export default EventHistory;
