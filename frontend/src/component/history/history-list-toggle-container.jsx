import { connect } from 'react-redux';
import HistoryListToggleComponent from './history-list-toggle-component';
import { fetchHistoryForToggle } from '../../store/history-actions';

function getHistoryFromToggle(state, toggleName) {
    if (!toggleName) {
        return [];
    }

    if (state.history.hasIn(['toggles', toggleName])) {
        return state.history.getIn(['toggles', toggleName]).toArray();
    }

    return [];
}

const mapStateToProps = (state, props) => ({
    history: getHistoryFromToggle(state, props.toggleName),
});

const HistoryListToggleContainer = connect(mapStateToProps, {
    fetchHistoryForToggle,
})(HistoryListToggleComponent);

export default HistoryListToggleContainer;
