import { connect } from 'react-redux';
import StrategiesListComponent from './list-component.jsx';
import { fetchStrategies, removeStrategy } from '../../store/strategy-actions';

const mapStateToProps = (state) => {
    const list = state.strategies.get('list').toArray();

    return {
        strategies: list,
    };
};

const mapDispatchToProps = (dispatch) => ({
    removeStrategy: (strategy) => {
        if (window.confirm('Are you sure you want to remove this strategy?')) {  // eslint-disable-line no-alert
            removeStrategy(strategy)(dispatch);
        }
    },
    fetchStrategies: () => fetchStrategies()(dispatch),
});

const StrategiesListContainer = connect(mapStateToProps, mapDispatchToProps)(StrategiesListComponent);

export default StrategiesListContainer;
