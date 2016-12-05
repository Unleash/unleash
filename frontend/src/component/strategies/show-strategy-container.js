import { connect } from 'react-redux';
import ShowStrategy from './show-strategy-component';
import { fetchStrategies, getApplicationsWithStrategy } from '../../store/strategy/actions';

const mapStateToProps = (state, props) => {
    let strategy = state.strategies.getIn(['list']).find(n => n.name === props.strategyName);
    return {
        strategy,
        getApplications: () => getApplicationsWithStrategy(props.strategyName),
    };
};

const Constainer = connect(mapStateToProps, { fetchStrategies })(ShowStrategy);

export default Constainer;
