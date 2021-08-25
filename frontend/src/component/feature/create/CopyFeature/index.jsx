import { connect } from 'react-redux';
import CopyFeatureComponent from './CopyFeature';
import {
    createFeatureToggles,
    validateName,
    fetchFeatureToggles,
} from '../../../../store/feature-toggle/actions';

const mapStateToProps = (state, props) => ({
    history: props.history,
    features: state.features.toJS(),
    copyToggle: state.features
        .toJS()
        .find(toggle => toggle.name === props.copyToggleName),
});

const mapDispatchToProps = dispatch => ({
    validateName,
    createFeatureToggle: featureToggle =>
        createFeatureToggles(featureToggle)(dispatch),
    fetchFeatureToggles: () => fetchFeatureToggles()(dispatch),
});

const FormAddContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(CopyFeatureComponent);

export default FormAddContainer;
