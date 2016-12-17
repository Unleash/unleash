import React, { PropTypes } from 'react';
import { Tabs, Tab, Grid, Cell, Icon, ProgressBar, List, ListItem, ListItemContent } from 'react-mdl';
import { Link } from 'react-router';

import Progress from './progress';

import { connect } from 'react-redux';
import EditFeatureToggle from './form-edit-container.jsx';
import { fetchFeatureToggles, toggleFeature } from '../../store/feature-actions';
import { fetchFeatureMetrics, fetchSeenApps } from '../../store/feature-metrics-actions';
import { fetchHistoryForToggle } from '../../store/history-actions';

import { AppsLinkList, SwitchWithLabel, getIcon, calc } from '../common';


const MetricTab = ({ metrics, featureToggle, toggleFeature }) => {
    const {
            lastHour = { yes: 0, no: 0, isFallback: true },
            lastMinute = { yes: 0, no: 0, isFallback: true },
            seenApps = [],
        } = metrics;

    const lastHourPercent = 1 * calc(lastHour.yes, lastHour.yes + lastHour.no, 0);
    const lastMinutePercent = 1 * calc(lastMinute.yes, lastMinute.yes + lastMinute.no, 0);

    return (<div>
        <SwitchWithLabel
        checked={featureToggle.enabled}
        onChange={() => toggleFeature(featureToggle)}>Toggle {featureToggle.name}</SwitchWithLabel>
        <hr />
        <Grid style={{ textAlign: 'center' }}>
            <Cell col={3}>
                {
                    lastMinute.isFallback ?
                    <Icon style={{ width: '100px', height: '100px', fontSize: '100px', color: '#ccc' }}
                    name="report problem" title="No metrics avaiable" /> :
                    <div>
                        <Progress animatePercentageText strokeWidth={10} percentage={lastMinutePercent} width="50" />
                    </div>
                }
                <p><strong>Last minute</strong><br /> Yes {lastMinute.yes}, No: {lastMinute.no}</p>
            </Cell>
            <Cell col={3}>
                {
                    lastHour.isFallback ?
                    <Icon style={{ width: '100px', height: '100px', fontSize: '100px', color: '#ccc' }}
                    name="report problem" title="No metrics avaiable" /> :
                    <div>
                        <Progress strokeWidth={10} percentage={lastHourPercent} width="50" />
                    </div>
                }
                <p><strong>Last hour</strong><br /> Yes {lastHour.yes}, No: {lastHour.no}</p>
            </Cell>
            <Cell col={6}>
                {seenApps.length > 0 ?
                    (<div><strong>Seen in applications:</strong></div>) :
                    <div>
                        <Icon style={{ width: '100px', height: '100px', fontSize: '100px', color: '#ccc' }}
                        name="report problem" title="Not used in a app in the last hour" />
                        <div><small><strong>Not used in a app in the last hour.</strong>
                        This might be due to your client implementation is not reporting usage.</small></div>
                    </div>
                }
                <AppsLinkList apps={seenApps} />
            </Cell>
        </Grid>
    </div>);
};

class EditFeatureToggleWrapper extends React.Component {

    constructor (props) {
        super(props);

        this.state = { activeTab: 0 };
    }

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

        const featureToggle = features.find(toggle => toggle.name === featureToggleName);

        if (!featureToggle) {
            if (features.length === 0 ) {
                return <ProgressBar indeterminate />;
            }
            return <span>Could not find the toggle "{this.props.featureToggleName}"</span>;
        }

        let tabContent;
        if (this.state.activeTab === 0) {
            tabContent = <MetricTab metrics={metrics} toggleFeature={toggleFeature} featureToggle={featureToggle} />;
        } else if (this.state.activeTab === 1) {
            tabContent = <EditFeatureToggle featureToggle={featureToggle} />;
        } else {
            tabContent = (
                <div>
                    <List style={{ textAlign: 'left' }}>
                        {history.map(({ createdAt, type, createdBy }, i) =>
                            <ListItem twoLine key={i}>
                                <ListItemContent title={type} avatar={getIcon(type)} subtitle={createdAt}>
                                    {type} <small>{createdBy}</small>
                                </ListItemContent>
                            </ListItem>)}
                    </List>
                    <Link to={`/history/${featureToggleName}`}>
                        See all events.
                    </Link>
                </div>
            );
        }

        return (
            <div>
                <h4>{featureToggle.name} <small>{featureToggle.enabled ? 'is enabled' : 'is disabled'}</small>
                    <small style={{ float: 'right', lineHeight: '38px' }}>
                        Created {(new Date(featureToggle.createdAt)).toLocaleString('nb-NO')}
                    </small>
                </h4>
                <div>{featureToggle.description}</div>
                <Tabs activeTab={this.state.activeTab}
                    onChange={(tabId) => this.setState({ activeTab: tabId })}
                    ripple
                    style={{ marginBottom: '10px' }}>
                    <Tab>Metrics</Tab>
                    <Tab>Edit</Tab>
                    <Tab>History</Tab>
                </Tabs>

                {tabContent}
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
})(EditFeatureToggleWrapper);
