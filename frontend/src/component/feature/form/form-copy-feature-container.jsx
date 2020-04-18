import { connect } from 'react-redux';
import CopyFeatureComponent from './form-copy-feature-component';
import { createFeatureToggles, validateName, fetchFeatureToggles } from './../../../store/feature-actions';

const mapStateToProps = (state, props) => ({
    history: props.history,
    copyToggle: state.features.toJS().find(toggle => toggle.name === props.copyToggleName),
});

const mapDispatchToProps = dispatch => ({
    validateName,
    createFeatureToggle: featureToggle => createFeatureToggles(featureToggle)(dispatch),
    fetchFeatureToggles: () => fetchFeatureToggles()(dispatch),
});

const FormAddContainer = connect(mapStateToProps, mapDispatchToProps)(CopyFeatureComponent);

export default FormAddContainer;
