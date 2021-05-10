import { connect } from 'react-redux';
import StrategiesList from './StrategiesList.jsx';
import {
    fetchStrategies,
    removeStrategy,
    deprecateStrategy,
    reactivateStrategy,
} from '../../../store/strategy/actions';

const mapStateToProps = state => {
    const list = state.strategies.get('list').toArray();

    return {
        strategies: list,
    };
};

const mapDispatchToProps = dispatch => ({
    removeStrategy: strategy => {
        removeStrategy(strategy)(dispatch);
    },
    deprecateStrategy: strategy => {
        deprecateStrategy(strategy)(dispatch);
    },
    reactivateStrategy: strategy => {
        reactivateStrategy(strategy)(dispatch);
    },
    fetchStrategies: () => fetchStrategies()(dispatch),
});

const StrategiesListContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(StrategiesList);

export default StrategiesListContainer;
