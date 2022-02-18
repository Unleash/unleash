import classNames from 'classnames';
import PercentageCircle from '../../../../common/PercentageCircle/PercentageCircle';
import { useStyles } from './FeatureEnvironmentMetrics.styles';
import { FiberManualRecord } from '@material-ui/icons';
import { useMediaQuery } from '@material-ui/core';
import { IFeatureEnvironmentMetrics } from '../../../../../interfaces/featureToggle';
import { parseISO } from 'date-fns';
import { calculatePercentage } from '../../../../../utils/calculate-percentage';
import StringTruncator from '../../../../common/StringTruncator/StringTruncator';

interface IFeatureEnvironmentProps {
    className?: string;
    primaryMetric?: boolean;
    metric?: IFeatureEnvironmentMetrics;
}

const FeatureEnvironmentMetrics = ({
    className,
    primaryMetric,
    metric,
}: IFeatureEnvironmentProps) => {
    const styles = useStyles();
    const smallScreen = useMediaQuery(`(max-width:1000px)`);

    if (!metric) return null;

    const containerClasses = classNames(styles.container, className, {
        [styles.primaryMetric]: primaryMetric,
    });
    let hour = '';
    if (metric?.timestamp) {
        const metricTime = parseISO(metric.timestamp);
        hour = `since ${metricTime.getHours()}:00`;
    }

    const total = metric.yes + metric.no;

    let primaryStyles = {};

    if (primaryMetric) {
        if (smallScreen) {
            primaryStyles = {
                width: '60px',
                height: '60px',
            };
        } else {
            primaryStyles = {
                width: '90px',
                height: '90px',
            };
        }
    }

    if (metric.yes === 0 && metric.no === 0) {
        return (
            <div className={containerClasses}>
                <div className={styles.headerContainer}>
                    <h2 data-loading className={styles.title}>
                        Traffic in&nbsp;
                        <StringTruncator
                            text={metric.environment}
                            className={styles.truncator}
                            maxWidth="200"
                        />
                        &nbsp;
                        {hour}
                    </h2>
                </div>

                <div className={styles.bodyContainer}>
                    <div className={styles.textContainer}>
                        <p className={styles.paragraph} data-loading>
                            No metrics available for this environment.
                        </p>
                    </div>

                    <div className={styles.chartContainer}>
                        <FiberManualRecord
                            style={{ transform: 'scale(1.4)' }}
                            className={styles.icon}
                            data-loading
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={containerClasses}>
            <div className={styles.headerContainer}>
                <h2 data-loading className={styles.title}>
                    Traffic in&nbsp;
                    <StringTruncator
                        text={metric.environment}
                        maxWidth="150"
                        className={styles.truncator}
                    />
                    &nbsp;
                    {hour}
                </h2>
            </div>

            <div className={styles.bodyContainer}>
                <div className={styles.textContainer}>
                    <div className={styles.trueCountContainer}>
                        <div>
                            <div className={styles.trueCount} data-loading />
                        </div>
                        <p className={styles.paragraph} data-loading>
                            {metric.yes} users received this feature
                        </p>
                    </div>

                    <div className={styles.trueCountContainer}>
                        <div>
                            <div className={styles.falseCount} data-loading />
                        </div>
                        <p className={styles.paragraph} data-loading>
                            {metric.no} users did not receive this feature
                        </p>
                    </div>
                </div>
                <div className={styles.chartContainer} data-loading>
                    <PercentageCircle
                        percentage={calculatePercentage(total, metric.yes)}
                        styles={{
                            height: '60px',
                            width: '60px',
                            marginLeft: '1rem',
                            ...primaryStyles,
                            transform: 'scale(1.6)',
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default FeatureEnvironmentMetrics;
