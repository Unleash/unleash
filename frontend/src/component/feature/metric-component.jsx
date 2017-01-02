import React, { PropTypes } from 'react';
import { Grid, Cell, Icon, Chip, ChipContact } from 'react-mdl';
import Progress from './progress';
import { Link } from 'react-router';
import { AppsLinkList, SwitchWithLabel, calc } from '../common';
import styles from './metrics.scss';

const StrategyChipItem = ({ strategy }) => (
    <Chip className={styles.chip}>
        <ChipContact className="mdl-color--blue-grey mdl-color-text--white">
            <Icon style={{ marginTop: '3px' }} name="link" />
        </ChipContact>
        <Link to={`/strategies/view/${strategy.name}`} className="mdl-color-text--blue-grey">{strategy.name}</Link>
    </Chip>
);

// TODO what about "missing" strategies here?
const StrategiesList = ({ strategies }) => (
    <div style={{ verticalAlign: 'middle' }}>With {strategies.length > 1 ? 'strategies' : 'strategy'} {
        strategies.map((strategy, i) => <StrategyChipItem key={i}  strategy={strategy} />)
    }</div>
);

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
            <div style={{ paddingTop: '4px' }}>
                <SwitchWithLabel
                    checked={featureToggle.enabled}
                    onChange={() => toggleFeature(featureToggle)}>Toggle {featureToggle.name}</SwitchWithLabel>
            </div>
            <hr style={{ borderColor: '#e0e0e0' }} />
            <Grid style={{ textAlign: 'center' }}>
                <Cell tablet={4} col={3} phone={12}>
                    {
                        lastMinute.isFallback ?
                        <Icon className={styles.problemIcon} name="report problem" title="No metrics avaiable" /> :
                        <div>
                            <Progress animatePercentageText strokeWidth={10} percentage={lastMinutePercent} width="50" />
                        </div>
                    }
                    <p><strong>Last minute</strong><br /> Yes {lastMinute.yes}, No: {lastMinute.no}</p>
                </Cell>
                <Cell col={3} tablet={4} phone={12}>
                    {
                        lastHour.isFallback ?
                        <Icon className={styles.problemIcon} name="report problem" title="No metrics avaiable" /> :
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
                            <Icon className={styles.problemIcon} name="report problem" title="Not used in a app in the last hour" />
                            <div><small><strong>Not used in a app in the last hour.</strong>
                            This might be due to your client implementation is not reporting usage.</small></div>
                        </div>
                    }
                    <AppsLinkList apps={seenApps} />
                </Cell>
            </Grid>
            <hr style={{ borderColor: '#e0e0e0' }} />
            <StrategiesList strategies={featureToggle.strategies}/>
        </div>);
    }
}
