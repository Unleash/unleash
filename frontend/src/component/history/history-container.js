import { connect } from 'react-redux';
import HistoryComponent from './history-component';
import { fetchHistory } from './../..//store/history/actions';

const mapStateToProps = state => {
    const history = state.history.get('list').toArray();
    return {
        history,
    };
};

const HistoryListContainer = connect(mapStateToProps, { fetchHistory })(HistoryComponent);

export default HistoryListContainer;
