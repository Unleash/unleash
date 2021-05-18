import { connect } from 'react-redux';
import {
    fetchFeatureToggles,
    toggleFeature,
} from '../../../store/feature-toggle/actions';
import ViewProject from './ViewProject';

const mapStateToProps = (state, props) => {
    const projectBase = { id: '', name: '', description: '' };
    const realProject = state.projects
        .toJS()
        .find(n => n.id === props.projectId);
    const project = Object.assign(projectBase, realProject);
    const features = state.features
        .toJS()
        .filter(feature => feature.project === project.id);

    const settings = state.settings.toJS();
    const featureMetrics = state.featureMetrics.toJS();

    return {
        project,
        features,
        settings,
        featureMetrics,
    };
};

const mapDispatchToProps = {
    toggleFeature,
    fetchFeatureToggles,
};

const FormAddContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(ViewProject);

export default FormAddContainer;
