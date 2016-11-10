import { connect } from 'react-redux';
import ListComponent from './history-list-component';
import { fetchHistory } from '../../store/history-actions';

const mapStateToProps = (state) => {
    const history = state.history.get('list').toArray();

    return {
        history,
    };
};

const HistoryListContainer = connect(mapStateToProps, { fetchHistory })(ListComponent);

export default HistoryListContainer;
