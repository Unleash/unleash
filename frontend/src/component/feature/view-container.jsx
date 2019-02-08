import { connect } from 'react-redux';

import {
    fetchFeatureToggles,
    toggleFeature,
    removeFeatureToggle,
    editFeatureToggle,
} from './../../store/feature-actions';

import ViewToggleComponent from './view-component';
import { hasPermission } from '../../permissions';

export default connect(
    (state, props) => ({
        features: state.features.toJS(),
        betaFlags: state.features
            .toJS()
            .filter(t => t.enabled)
            .filter(t => t.name.startsWith('unleash.beta'))
            .map(t => t.name),
        featureToggle: state.features.toJS().find(toggle => toggle.name === props.featureToggleName),
        activeTab: props.activeTab,
        hasPermission: hasPermission.bind(null, state.user.get('profile')),
    }),
    {
        fetchFeatureToggles,
        toggleFeature,
        removeFeatureToggle,
        editFeatureToggle,
    }
)(ViewToggleComponent);
