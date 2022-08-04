import EventLog from '../EventLog';
import { useFeatureEvents } from 'hooks/api/getters/useFeatureEvents/useFeatureEvents';

interface IFeatureEventHistoryProps {
    featureId: string;
}

export const FeatureEventHistory = ({
    featureId,
}: IFeatureEventHistoryProps) => {
    const { events } = useFeatureEvents(featureId);

    if (events.length === 0) {
        return null;
    }

    return <EventLog events={events} title="Event log" displayInline />;
};
