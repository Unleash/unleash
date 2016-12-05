import React, { PropTypes } from 'react';
import { Grid, Cell, Icon, Switch } from 'react-mdl';

import percentLib from 'percent';
import Progress from './progress';

import { connect } from 'react-redux';
import EditFeatureToggle from './form-edit-container.jsx';
import { fetchFeatureToggles, toggleFeature } from '../../store/feature-actions';
import { fetchFeatureMetrics } from '../../store/feature-metrics-actions';

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
        this.props.fetchFeatureMetrics();
        setInterval(() => {
            this.props.fetchFeatureMetrics();
        }, 5000);
    }

    render () {
        const {
            toggleFeature,
            features,
            featureToggleName,
            metrics = {
                lastHour: { yes: 0, no: 0, isFallback: true },
                lastMinute: { yes: 0, no: 0, isFallback: true },
            },
        } = this.props;

        const lastHourPercent = 1 * percentLib.calc(metrics.lastHour.yes, metrics.lastHour.yes + metrics.lastHour.no, 0);
        const lastMinutePercent = 1 * percentLib.calc(metrics.lastMinute.yes, metrics.lastMinute.yes + metrics.lastMinute.no, 0);

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
                <div style={{ maxWidth: '150px' }} >
                    <Switch style={{ cursor: 'pointer' }} onChange={() => toggleFeature(featureToggle)} checked={featureToggle.enabled}>
                        Toggle {featureToggle.name}
                    </Switch>
                </div>
                <hr />
                <Grid>
                    <Cell col={3} style={{ textAlign: 'center' }}>
                        {
                            metrics.lastMinute.isFallback ?
                            <Icon style={{ width: '100px', height: '100px', fontSize: '100px', color: '#ccc' }} name="report problem" title="No metrics avaiable" /> :
                            <div>
                                <Progress strokeWidth={10} percentage={lastMinutePercent} width="50" />
                            </div>
                        }
                        <p><strong>Last minute:</strong> Yes {metrics.lastMinute.yes}, No: {metrics.lastMinute.no}</p>
                    </Cell>
                    <Cell col={3} style={{ textAlign: 'center' }}>
                        {
                            metrics.lastHour.isFallback ?
                            <Icon style={{ width: '100px', height: '100px', fontSize: '100px', color: '#ccc' }} name="report problem" title="No metrics avaiable" /> :
                            <div>
                                <Progress strokeWidth={10} percentage={lastHourPercent} width="50" />
                            </div>
                        }
                        <p><strong>Last hour:</strong> Yes {metrics.lastHour.yes}, No: {metrics.lastHour.no}</p>
                    </Cell>
                    <Cell col={3}>
                        <p>add apps</p>
                    </Cell>
                    <Cell col={3}>
                            <p>add instances</p>
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
    if (state.featureMetrics.hasIn(['lastHour', toggleName])) {
        return {
            lastHour: state.featureMetrics.getIn(['lastHour', toggleName]),
            lastMinute: state.featureMetrics.getIn(['lastMinute', toggleName]),
        };
    }
}


export default connect((state, props) => ({
    features: state.features.toJS(),
    metrics: getMetricsForToggle(state, props.featureToggleName),
}), {
    fetchFeatureMetrics,
    fetchFeatureToggles,
    toggleFeature,
})(EditFeatureToggleWrapper);
