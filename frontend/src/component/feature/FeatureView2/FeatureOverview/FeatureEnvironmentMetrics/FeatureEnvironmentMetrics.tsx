import classNames from 'classnames';
import PercentageCircle from '../../../../common/PercentageCircle/PercentageCircle';
import { useStyles } from './FeatureEnvironmentMetrics.styles';
import PieChartIcon from '@material-ui/icons/PieChart';
import { useMediaQuery } from '@material-ui/core';
import { IFeatureEnvironmentMetrics } from '../../../../../interfaces/featureToggle';
import { parseISO } from 'date-fns';

interface IFeatureEnvironmentProps {
    className?: string;
    primaryMetric?: boolean;
    metric: IFeatureEnvironmentMetrics;
}

const FeatureEnvironmentMetrics = ({
    className,
    primaryMetric,
    metric,
}: IFeatureEnvironmentProps) => {
    const styles = useStyles();
    const smallScreen = useMediaQuery(`(max-width:1000px)`);

    const containerClasses = classNames(styles.container, className, {
        [styles.primaryMetric]: primaryMetric,
    });
    let hour = '';
    if (metric?.timestamp) {
        const metricTime = parseISO(metric.timestamp);
        hour = `since ${metricTime.getHours()}:00`;
    }

    const calculatePercentage = () => {
        const total = metric.yes + metric.no;
        if (total === 0) {
            return 0;
        }

        return Math.round((metric.yes / total) * 100);
    };

    let primaryStyles = {};

    if (primaryMetric) {
        if (smallScreen) {
            primaryStyles = {
                width: '60px',
                height: '60px',
            };
        } else {
            primaryStyles = {
                width: '120px',
                height: '120px',
            };
        }
    }

    if (metric.yes === 0 && metric.no === 0) {
        return (
            <div className={containerClasses}>
                <div className={styles.headerContainer}>
                    <h2 data-loading className={styles.title}>
                        Traffic in {metric.environment} {hour}
                    </h2>
                </div>

                <div className={styles.bodyContainer}>
                    <div className={styles.textContainer}>
                        <p className={styles.paragraph} data-loading>
                            No metrics available for this environment.
                        </p>
                    </div>

                    <div className={styles.chartContainer}>
                        <PieChartIcon className={styles.icon} data-loading />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={containerClasses}>
            <div className={styles.headerContainer}>
                <h2 data-loading className={styles.title}>
                    Traffic in {metric.environment} {hour}
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
                        percentage={calculatePercentage()}
                        styles={{
                            height: '60px',
                            width: '60px',
                            marginLeft: '1rem',
                            ...primaryStyles,
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default FeatureEnvironmentMetrics;
