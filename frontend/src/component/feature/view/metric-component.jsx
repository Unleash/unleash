import React from 'react';
import PropTypes from 'prop-types';
import { Chip, Grid } from '@material-ui/core';
import { ReportProblem, Link as LinkIcon } from '@material-ui/icons';

import { Link } from 'react-router-dom';
import { AppsLinkList, calc } from '../../common';
import { formatFullDateTimeWithLocale } from '../../common/util';
import Progress from '../ProgressWheel';
import ConditionallyRender from '../../common/ConditionallyRender/ConditionallyRender';

import styles from './metric.module.scss';

const StrategyChipItem = ({ strategy }) => (
    <Chip
        clickable
        className={styles.chip}
        label={strategy.name}
        component={Link}
        to={`/strategies/view/${strategy.name}`}
        icon={<LinkIcon />}
    />
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
    renderLastSeen = lastSeenAt =>
        lastSeenAt ? this.formatFullDateTime(lastSeenAt) : 'Never reported';

    render() {
        const { metrics = {}, featureToggle } = this.props;
        const {
            lastHour = { yes: 0, no: 0, isFallback: true },
            lastMinute = { yes: 0, no: 0, isFallback: true },
            seenApps = [],
        } = metrics;

        const lastHourPercent =
            1 * calc(lastHour.yes, lastHour.yes + lastHour.no, 0);
        const lastMinutePercent =
            1 * calc(lastMinute.yes, lastMinute.yes + lastMinute.no, 0);

        return (
            <div style={{ padding: '16px', flexGrow: 1 }}>
                <Grid
                    container
                    spacing={2}
                    justify="center"
                    className={styles.grid}
                >
                    <Grid item xs={12} sm={4}>
                        <Progress
                            percentage={lastMinutePercent}
                            isFallback={lastMinute.isFallback}
                            animatePercentageText
                        />
                        <ConditionallyRender
                            condition={lastMinute.isFallback}
                            show={<p>No metrics available</p>}
                            elseShow={
                                <p>
                                    <strong>Last minute</strong>
                                    <br /> Yes {lastMinute.yes}, No:{' '}
                                    {lastMinute.no}
                                </p>
                            }
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Progress
                            percentage={lastHourPercent}
                            isFallback={lastHour.isFallback}
                        />
                        <ConditionallyRender
                            condition={lastHour.isFallback}
                            show={<p>No metrics available</p>}
                            elseShow={
                                <p>
                                    <strong>Last hour</strong>
                                    <br /> Yes {lastHour.yes}, No: {lastHour.no}
                                </p>
                            }
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <ConditionallyRender
                            condition={seenApps.length}
                            show={
                                <div>
                                    <strong>Seen in applications:</strong>
                                </div>
                            }
                            elseShow={
                                <div>
                                    <ReportProblem
                                        className={styles.problemIcon}
                                        title="Not used in an app in the last hour"
                                    />
                                    <div>
                                        <small>
                                            <strong>
                                                Not used in an app in the last
                                                hour.{' '}
                                            </strong>
                                            This might be due to your client
                                            implementation not reporting usage.
                                        </small>
                                    </div>
                                </div>
                            }
                        />

                        <AppsLinkList apps={seenApps} />
                        <div>
                            <ConditionallyRender
                                condition={featureToggle.createdAt}
                                show={
                                    <>
                                        <strong>Created: </strong>
                                        <span>
                                            {this.formatFullDateTime(
                                                featureToggle.createdAt
                                            )}
                                        </span>
                                    </>
                                }
                            />

                            <br />
                            <strong>Last seen: </strong>
                            <span>
                                {this.renderLastSeen(featureToggle.lastSeenAt)}
                            </span>
                        </div>
                    </Grid>
                </Grid>
                <hr />
                <StrategiesList strategies={featureToggle.strategies || []} />
            </div>
        );
    }
}
