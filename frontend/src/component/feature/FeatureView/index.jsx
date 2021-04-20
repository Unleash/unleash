import { connect } from 'react-redux';

import {
    fetchFeatureToggles,
    fetchFeatureToggle,
    toggleFeature,
    setStale,
    removeFeatureToggle,
    editFeatureToggle,
} from '../../../store/feature-toggle/actions';

import FeatureView from './FeatureView';
import { fetchTags, tagFeature, untagFeature } from '../../../store/feature-tags/actions';

export default connect(
    (state, props) => ({
        features: state.features.toJS(),
        featureToggle: state.features.toJS().find(toggle => toggle.name === props.featureToggleName),
        featureTags: state.featureTags.toJS(),
        tagTypes: state.tagTypes.toJS(),
        activeTab: props.activeTab,
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
)(FeatureView);
