
import { connect } from 'react-redux';

import { fetchFeatureToggles, toggleFeature } from '../../store/feature-actions';
import { fetchFeatureMetrics, fetchSeenApps } from '../../store/feature-metrics-actions';
import { fetchHistoryForToggle } from '../../store/history-actions';

import ViewToggleComponent from './view-component';

function getMetricsForToggle (state, toggleName) {
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

function getHistoryFromToggle (state, toggleName) {
    if (!toggleName) {
        return [];
    }

    if (state.history.hasIn(['toggles', toggleName])) {
        return state.history
            .getIn(['toggles', toggleName])
            .slice(0, 10)
            .toJS()
            .map(({ createdAt, createdBy, type }) => ({
                createdAt: new Date(createdAt).toLocaleString('nb-NO'),
                createdBy,
                type,
            }));
    }

    return [];
}


export default connect((state, props) => ({
    features: state.features.toJS(),
    metrics: getMetricsForToggle(state, props.featureToggleName),
    history: getHistoryFromToggle(state, props.featureToggleName),
}), {
    fetchFeatureMetrics,
    fetchFeatureToggles,
    toggleFeature,
    fetchSeenApps,
    fetchHistoryForToggle,
})(ViewToggleComponent);
