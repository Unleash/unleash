import React, { PropTypes } from 'react';
import { Grid, Cell, Icon } from 'react-mdl';
import Progress from './progress';
import { AppsLinkList, SwitchWithLabel, calc } from '../common';


export default class MetricComponent extends React.Component {
    static propTypes () {
        return {
            metrics: PropTypes.object.isRequired,
            featureToggle: PropTypes.object.isRequired,
            toggleFeature: PropTypes.func.isRequired,
            fetchSeenApps: PropTypes.func.isRequired,
            fetchFeatureMetrics: PropTypes.func.isRequired,
        };
    }

    componentWillMount () {
        this.props.fetchSeenApps();
        this.props.fetchFeatureMetrics();
        this.timer = setInterval(() => {
            this.props.fetchFeatureMetrics();
        }, 5000);
    }

    componentWillUnmount () {
        clearInterval(this.timer);
    }

    render () {
        const { metrics = {}, featureToggle, toggleFeature } = this.props;
        const {
            lastHour = { yes: 0, no: 0, isFallback: true },
            lastMinute = { yes: 0, no: 0, isFallback: true },
            seenApps = [],
        } = metrics;

        const lastHourPercent = 1 * calc(lastHour.yes, lastHour.yes + lastHour.no, 0);
        const lastMinutePercent = 1 * calc(lastMinute.yes, lastMinute.yes + lastMinute.no, 0);

        return (<div>
            <SwitchWithLabel checked={featureToggle.enabled} onChange={() => toggleFeature(featureToggle)}>Toggle {featureToggle.name}</SwitchWithLabel>
            <hr />
            <Grid style={{ textAlign: 'center' }}>
                <Cell tablet={4} col={3} phone={12}>
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
                <Cell col={3} tablet={4} phone={12}>
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
                <Cell col={6}  tablet={12}>
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
    }
}
