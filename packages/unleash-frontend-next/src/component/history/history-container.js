import { connect } from 'react-redux';
import ListComponent from './history-list-component';
import { fetchHistory } from '../../store/history-actions';

const mapStateToProps = (state) => {
    const history = state.history.get('list').toArray(); // eslint-disable-line no-shadow

    return {
        history,
    };
};

const StrategiesListContainer = connect(mapStateToProps, { fetchHistory })(ListComponent);

export default StrategiesListContainer;
