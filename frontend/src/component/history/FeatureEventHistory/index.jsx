import { connect } from 'react-redux';
import FeatureEventHistory from './FeatureEventHistory';
import { fetchHistoryForToggle } from '../../../store/history/actions';

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

const FeatureEventHistoryContainer = connect(mapStateToProps, {
    fetchHistoryForToggle,
})(FeatureEventHistory);

export default FeatureEventHistoryContainer;
