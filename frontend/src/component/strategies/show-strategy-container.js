import { connect } from 'react-redux';
import ShowStrategy from './show-strategy-component';
import { fetchStrategies } from '../../store/strategy/actions';
import { fetchAll } from '../../store/application/actions';

const mapStateToProps = (state, props) => {
    let strategy = state.strategies
        .get('list')
        .find(n => n.name === props.strategyName);
    const applications = state.applications
        .get('list')
        .filter(app => app.strategies.includes(props.strategyName));

    return {
        strategy,
        applications: applications && applications.toJS(),
    };
};

const Constainer = connect(mapStateToProps, {
    fetchStrategies,
    fetchApplications: fetchAll,
})(ShowStrategy);

export default Constainer;
