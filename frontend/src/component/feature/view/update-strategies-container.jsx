/* eslint-disable no-console */
import { connect } from 'react-redux';

import { requestUpdateFeatureToggleStrategies } from '../../../store/feature-toggle/actions';
import UpdateStrategiesComponent from './update-strategies-component';

const mapStateToProps = (state, ownProps) => ({
    featureToggleName: ownProps.featureToggle.name,
    configuredStrategies: ownProps.featureToggle.strategies,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    saveStrategies: strategies => {
        const featureToggle = ownProps.featureToggle;
        return requestUpdateFeatureToggleStrategies(featureToggle, strategies)(dispatch);
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(UpdateStrategiesComponent);
