import { connect } from 'react-redux';

import {
    fetchFeatureToggles,
    toggleFeature,
    removeFeatureToggle,
    editFeatureToggle,
} from '../../store/feature-actions';

import ViewToggleComponent from './view-component';

export default connect(
    (state, props) => ({
        features: state.features.toJS(),
        featureToggle: state.features.toJS().find(toggle => toggle.name === props.featureToggleName),
        activeTab: props.activeTab,
    }),
    {
        fetchFeatureToggles,
        toggleFeature,
        removeFeatureToggle,
        editFeatureToggle,
    }
)(ViewToggleComponent);
