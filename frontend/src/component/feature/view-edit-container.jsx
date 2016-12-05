import React, { PropTypes } from 'react';
import { Grid, Cell, Icon, Switch } from 'react-mdl';
import { Link } from 'react-router';

import percentLib from 'percent';
import Progress from './progress';

import { connect } from 'react-redux';
import EditFeatureToggle from './form-edit-container.jsx';
import { fetchFeatureToggles, toggleFeature } from '../../store/feature-actions';
import { fetchFeatureMetrics, fetchSeenApps } from '../../store/feature-metrics-actions';
import { fetchHistoryForToggle } from '../../store/history-actions';

class EditFeatureToggleWrapper extends React.Component {

    static propTypes () {
        return {
            featureToggleName: PropTypes.string.isRequired,
            features: PropTypes.array.isRequired,
            fetchFeatureToggles: PropTypes.array.isRequired,
        };
    }

    componentWillMount () {
        if (this.props.features.length === 0) {
            this.props.fetchFeatureToggles();
        }
        this.props.fetchSeenApps();
        this.props.fetchHistoryForToggle(this.props.featureToggleName);
        this.props.fetchFeatureMetrics();
        this.timer = setInterval(() => {
            this.props.fetchSeenApps();
            this.props.fetchFeatureMetrics();
        }, 5000);
    }

    componentWillUnmount () {
        clearInterval(this.timer);
    }

    render () {
        const {
            history,
            toggleFeature,
            features,
            featureToggleName,
            metrics = {},
        } = this.props;

        const {
            lastHour = { yes: 0, no: 0, isFallback: true },
            lastMinute = { yes: 0, no: 0, isFallback: true },
            seenApps = [],
        } = metrics;

        const lastHourPercent = 1 * percentLib.calc(lastHour.yes, lastHour.yes + lastHour.no, 0);
        const lastMinutePercent = 1 * percentLib.calc(lastMinute.yes, lastMinute.yes + lastMinute.no, 0);

        const featureToggle = features.find(toggle => toggle.name === featureToggleName);

        if (!featureToggle) {
            if (features.length === 0 ) {
                return <span>Loading</span>;
            }
            return <span>Could not find {this.props.featureToggleName}</span>;
        }

        return (
            <div>
                <h4>{featureToggle.name} <small>{featureToggle.enabled ? 'is enabled' : 'is disabled'}</small></h4>
                <hr />
                <div style={{ maxWidth: '200px' }} >
                    <Switch style={{ cursor: 'pointer' }} onChange={() => toggleFeature(featureToggle)} checked={featureToggle.enabled}>
                        Toggle {featureToggle.name}
                    </Switch>
                </div>
                <hr />
                <Grid style={{ textAlign: 'center' }}>
                    <Cell col={3}>
                        {
                            lastMinute.isFallback ?
                            <Icon style={{ width: '100px', height: '100px', fontSize: '100px', color: '#ccc' }} name="report problem" title="No metrics avaiable" /> :
                            <div>
                                <Progress strokeWidth={10} percentage={lastMinutePercent} width="50" />
                            </div>
                        }
                        <p><strong>Last minute</strong><br /> Yes {lastMinute.yes}, No: {lastMinute.no}</p>
                    </Cell>
                    <Cell col={3}>
                        {
                            lastHour.isFallback ?
                            <Icon style={{ width: '100px', height: '100px', fontSize: '100px', color: '#ccc' }} name="report problem" title="No metrics avaiable" /> :
                            <div>
                                <Progress strokeWidth={10} percentage={lastHourPercent} width="50" />
                            </div>
                        }
                        <p><strong>Last hour</strong><br /> Yes {lastHour.yes}, No: {lastHour.no}</p>
                    </Cell>
                    <Cell col={3}>
                        {seenApps.length > 0 ?
                            (<div><strong>Seen in applications:</strong></div>) :
                            <div>
                                <Icon style={{ width: '100px', height: '100px', fontSize: '100px', color: '#ccc' }} name="report problem" title="Not used in a app in the last hour" />
                                <div><small><strong>Not used in a app in the last hour.</strong> This might be due to your client implementation is not reporting usage.</small></div>
                            </div>
                        }
                        {seenApps.length > 0 && seenApps.map((appName) => (
                            <Link key={appName} to={`/applications/${appName}`}>
                                {appName}
                            </Link>
                        ))}
                        <p>add instances count?</p>
                    </Cell>
                    <Cell col={3}>
                            <div><strong>History</strong></div>
                            <ol>
                                {history.map(({ createdAt, type, createdBy }) => 
                                    <li><small>{createdAt}</small> {type} {createdBy}</li>)}
                            </ol>
                            <Link to={`/history/${featureToggleName}`}>
                                See all events.
                            </Link>
                    </Cell>
                </Grid>
                <hr />
                <h4>Edit</h4>
                <EditFeatureToggle featureToggle={featureToggle} />
            </div>
        );
    }
}

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
            .slice(0, 5)
            .toJS()
            .map(({ createdAt, createdBy, type }) => ({
                createdAt: new Date(createdAt).toString(),
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
})(EditFeatureToggleWrapper);
