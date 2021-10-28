import { connect } from 'react-redux';

import { fetchFeatureToggles } from '../../../store/feature-toggle/actions';

import RedirectFeatureView from './RedirectFeatureView';

import { E } from '../../common/flags';

export default connect(
    (state, props) => ({
        newPath: !!state.uiConfig.toJS().flags[E],
        featureToggle: state.features
            .toJS()
            .find(toggle => toggle.name === props.featureToggleName),
    }),
    {
        fetchFeatureToggles,
    }
)(RedirectFeatureView);
