import { connect } from 'react-redux';

import { fetchFeatureToggles } from '../../../store/feature-toggle/actions';

import RedirectFeatureView from './RedirectFeatureView';

export default connect(
    (state, props) => ({
        featureToggle: state.features
            .toJS()
            .find(toggle => toggle.name === props.featureToggleName),
    }),
    {
        fetchFeatureToggles,
    }
)(RedirectFeatureView);
