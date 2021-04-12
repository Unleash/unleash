import PropTypes from 'prop-types';
import { useEffect } from 'react';
import EventLog from '../EventLog';

const FeatureEventHistory = ({
    toggleName,
    history,
    fetchHistoryForToggle,
}) => {
    useEffect(() => {
        fetchHistoryForToggle(toggleName);
    }, [fetchHistoryForToggle, toggleName]);

    if (!history || history.length === 0) {
        return <span>fetching..</span>;
    }

    return (
        <EventLog history={history} hideName title="Change log" displayInline />
    );
};

FeatureEventHistory.propTypes = {
    toggleName: PropTypes.string.isRequired,
    history: PropTypes.array,
    fetchHistoryForToggle: PropTypes.func.isRequired,
};

export default FeatureEventHistory;
