import { connect } from 'react-redux';
import EventHistory from './EventHistory';
import { fetchHistory } from '../../../store/history/actions';

const mapStateToProps = state => {
    const history = state.history.get('list').toArray();
    return {
        history,
    };
};

const EventHistoryContainer = connect(mapStateToProps, { fetchHistory })(
    EventHistory
);

export default EventHistoryContainer;
