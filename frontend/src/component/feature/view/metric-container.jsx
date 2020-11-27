import { connect } from 'react-redux';

import { fetchFeatureMetrics, fetchSeenApps } from '../../../store/feature-metrics-actions';

import MatricComponent from './metric-component';

function getMetricsForToggle(state, toggleName) {
    if (!toggleName) {
        return;
    }
    const result = {};

    if (state.featureMetrics.hasIn(['seenApps', toggleName])) {
        result.seenApps = state.featureMetrics.getIn(['seenApps', toggleName]);
    }
    if (state.featureMetrics.hasIn(['lastHour', toggleName])) {
        result.lastHour = state.featureMetrics.getIn(['lastHour', toggleName]);
        result.lastMinute = state.featureMetrics.getIn(['lastMinute', toggleName]);
    }
    return result;
}

export default connect(
    (state, props) => ({
        metrics: getMetricsForToggle(state, props.featureToggle.name),
        location: state.settings.toJS().location || {},
    }),
    {
        fetchFeatureMetrics,
        fetchSeenApps,
    }
)(MatricComponent);
