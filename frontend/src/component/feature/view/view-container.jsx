import { connect } from 'react-redux';

import {
    fetchFeatureToggles,
    fetchFeatureToggle,
    toggleFeature,
    setStale,
    removeFeatureToggle,
    editFeatureToggle,
} from './../../../store/feature-toggle/actions';

import ViewToggleComponent from './view-component';
import { hasPermission } from '../../../permissions';
import { fetchTags, tagFeature, untagFeature } from '../../../store/feature-tags/actions';

export default connect(
    (state, props) => ({
        features: state.features.toJS(),
        featureToggle: state.features.toJS().find(toggle => toggle.name === props.featureToggleName),
        featureTags: state.featureTags.toJS(),
        tagTypes: state.tagTypes.toJS(),
        activeTab: props.activeTab,
        hasPermission: hasPermission.bind(null, state.user.get('profile')),
    }),
    {
        fetchFeatureToggles,
        fetchFeatureToggle,
        toggleFeature,
        setStale,
        removeFeatureToggle,
        editFeatureToggle,
        tagFeature,
        untagFeature,
        fetchTags,
    }
)(ViewToggleComponent);
