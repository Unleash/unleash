import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Cell, Icon, Chip, ChipContact } from 'react-mdl';
import Progress from '../progress-component';
import { Link } from 'react-router-dom';
import { AppsLinkList, calc } from '../../common';
import { formatFullDateTimeWithLocale } from '../../common/util';
import styles from './metric.module.scss';

const StrategyChipItem = ({ strategy }) => (
    <Chip className={styles.chip}>
        <ChipContact className="mdl-color--blue-grey mdl-color-text--white">
            <Icon style={{ marginTop: '3px' }} name="link" />
        </ChipContact>
        <Link to={`/strategies/view/${strategy.name}`} className="mdl-color-text--blue-grey">
            {strategy.name}
        </Link>
    </Chip>
);
StrategyChipItem.propTypes = {
    strategy: PropTypes.object.isRequired,
};

// TODO what about "missing" strategies here?
const StrategiesList = ({ strategies }) => (
    <div style={{ verticalAlign: 'middle', paddingTop: '14px' }}>
        With {strategies.length > 1 ? 'strategies' : 'strategy'}{' '}
        {strategies.map((strategy, i) => (
            <StrategyChipItem key={i} strategy={strategy} />
        ))}
    </div>
);
StrategiesList.propTypes = {
    strategies: PropTypes.array.isRequired,
};

export default class MetricComponent extends React.Component {
    static propTypes = {
        metrics: PropTypes.object.isRequired,
        featureToggle: PropTypes.object.isRequired,
        fetchSeenApps: PropTypes.func.isRequired,
        fetchFeatureMetrics: PropTypes.func.isRequired,
        location: PropTypes.object,
    };

    // eslint-disable-next-line camelcase
    UNSAFE_componentWillMount() {
        this.props.fetchSeenApps();
        this.props.fetchFeatureMetrics();
    }
    formatFullDateTime(v) {
        return formatFullDateTimeWithLocale(v, this.props.location.locale);
    }
    renderLastSeen = lastSeenAt => (lastSeenAt ? this.formatFullDateTime(lastSeenAt) : 'Never reported');

    render() {
        const { metrics = {}, featureToggle } = this.props;
        const {
            lastHour = { yes: 0, no: 0, isFallback: true },
            lastMinute = { yes: 0, no: 0, isFallback: true },
            seenApps = [],
        } = metrics;

        const lastHourPercent = 1 * calc(lastHour.yes, lastHour.yes + lastHour.no, 0);
        const lastMinutePercent = 1 * calc(lastMinute.yes, lastMinute.yes + lastMinute.no, 0);

        return (
            <div style={{ padding: '16px' }}>
                <Grid style={{ textAlign: 'center' }}>
                    <Cell col={4} tablet={4} phone={12}>
                        <Progress
                            percentage={lastMinutePercent}
                            isFallback={lastMinute.isFallback}
                            colorClassName="mdl-color-text--accent"
                            animatePercentageText
                        />
                        {lastMinute.isFallback ? (
                            <p className="mdl-color-text--grey-500">No metrics available</p>
                        ) : (
                            <p>
                                <strong>Last minute</strong>
                                <br /> Yes {lastMinute.yes}, No: {lastMinute.no}
                            </p>
                        )}
                    </Cell>
                    <Cell col={4} tablet={4} phone={12}>
                        <Progress percentage={lastHourPercent} isFallback={lastHour.isFallback} />
                        {lastHour.isFallback ? (
                            <p className="mdl-color-text--grey-500">No metrics available</p>
                        ) : (
                            <p>
                                <strong>Last hour</strong>
                                <br /> Yes {lastHour.yes}, No: {lastHour.no}
                            </p>
                        )}
                    </Cell>
                    <Cell col={4} tablet={12}>
                        {seenApps.length > 0 ? (
                            <div>
                                <strong>Seen in applications:</strong>
                            </div>
                        ) : (
                            <div>
                                <Icon
                                    className={styles.problemIcon}
                                    name="report problem"
                                    title="Not used in an app in the last hour"
                                />
                                <div>
                                    <small>
                                        <strong>Not used in an app in the last hour. </strong>
                                        This might be due to your client implementation not reporting usage.
                                    </small>
                                </div>
                            </div>
                        )}
                        <AppsLinkList apps={seenApps} />
                        <div>
                            <strong>Created: </strong>
                            <span>{this.formatFullDateTime(featureToggle.createdAt)}</span>
                            <br />
                            <strong>Last seen: </strong>
                            <span>{this.renderLastSeen(featureToggle.lastSeenAt)}</span>
                        </div>
                    </Cell>
                </Grid>
                <hr />
                <StrategiesList strategies={featureToggle.strategies} />
            </div>
        );
    }
}
