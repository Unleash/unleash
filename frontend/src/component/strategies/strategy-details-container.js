import { connect } from 'react-redux';
import ShowStrategy from './strategy-details-component';
import { fetchStrategies } from './../../store/strategy/actions';
import { fetchAll } from './../../store/application/actions';
import { fetchFeatureToggles } from './../../store/feature-actions';
import { hasPermission } from '../../permissions';

const mapStateToProps = (state, props) => {
    let strategy = state.strategies.get('list').find(n => n.name === props.strategyName);
    const applications = state.applications.get('list').filter(app => app.strategies.includes(props.strategyName));
    const toggles = state.features.filter(
        toggle => toggle.get('strategies').findIndex(s => s.name === props.strategyName) > -1
    );

    return {
        strategy,
        strategyName: props.strategyName,
        applications: applications && applications.toJS(),
        toggles: toggles && toggles.toJS(),
        activeTab: props.activeTab,
        hasPermission: hasPermission.bind(null, state.user.get('profile')),
    };
};

const Constainer = connect(mapStateToProps, {
    fetchStrategies,
    fetchApplications: fetchAll,
    fetchFeatureToggles,
})(ShowStrategy);

export default Constainer;
