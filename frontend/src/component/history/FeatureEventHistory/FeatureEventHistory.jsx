import PropTypes from 'prop-types';
import EventLog from '../EventLog';
import { useFeatureEvents } from 'hooks/api/getters/useFeatureEvents/useFeatureEvents';

export const FeatureEventHistory = ({ toggleName }) => {
    const { events } = useFeatureEvents(toggleName);

    if (events.length === 0) {
        return null;
    }

    return (
        <EventLog history={events} hideName title="Change log" displayInline />
    );
};

FeatureEventHistory.propTypes = {
    toggleName: PropTypes.string.isRequired,
};
