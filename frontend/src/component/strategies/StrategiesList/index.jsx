import { connect } from 'react-redux';
import StrategiesList from './StrategiesList.jsx';
import {
    fetchStrategies,
    removeStrategy,
    deprecateStrategy,
    reactivateStrategy,
} from '../../../store/strategy/actions';
import { hasPermission } from '../../../permissions';

const mapStateToProps = state => {
    const list = state.strategies.get('list').toArray();

    return {
        strategies: list,
        hasPermission: hasPermission.bind(null, state.user.get('profile')),
    };
};

const mapDispatchToProps = dispatch => ({
    removeStrategy: strategy => {
        // eslint-disable-next-line no-alert
        if (window.confirm('Are you sure you want to remove this strategy?')) {
            removeStrategy(strategy)(dispatch);
        }
    },
    deprecateStrategy: strategy => {
        // eslint-disable-next-line no-alert
        if (window.confirm('Are you sure you want to deprecate this strategy?')) {
            deprecateStrategy(strategy)(dispatch);
        }
    },
    reactivateStrategy: strategy => {
        // eslint-disable-next-line no-alert
        if (window.confirm('Are you sure you want to reactivate this strategy?')) {
            reactivateStrategy(strategy)(dispatch);
        }
    },
    fetchStrategies: () => fetchStrategies()(dispatch),
});

const StrategiesListContainer = connect(mapStateToProps, mapDispatchToProps)(StrategiesList);

export default StrategiesListContainer;
