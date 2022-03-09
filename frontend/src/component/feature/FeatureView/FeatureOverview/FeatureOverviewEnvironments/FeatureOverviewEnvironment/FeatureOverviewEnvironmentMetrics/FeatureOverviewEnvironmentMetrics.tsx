import { FiberManualRecord } from '@material-ui/icons';
import { IFeatureEnvironmentMetrics } from '../../../../../../../interfaces/featureToggle';
import { calculatePercentage } from '../../../../../../../utils/calculate-percentage';
import PercentageCircle from '../../../../../../common/PercentageCircle/PercentageCircle';
import { useStyles } from './FeatureOverviewEnvironmentMetrics.styles';

interface IFeatureOverviewEnvironmentMetrics {
    environmentMetric?: IFeatureEnvironmentMetrics;
}

const FeatureOverviewEnvironmentMetrics = ({
    environmentMetric,
}: IFeatureOverviewEnvironmentMetrics) => {
    const styles = useStyles();

    if (!environmentMetric) return null;

    const total = environmentMetric.yes + environmentMetric.no;
    const percentage = calculatePercentage(total, environmentMetric?.yes);

    if (
        !environmentMetric ||
        (environmentMetric.yes === 0 && environmentMetric.no === 0)
    ) {
        return (
            <div className={styles.container}>
                <div className={styles.info}>
                    <p className={styles.percentage} data-loading>
                        {percentage}%
                    </p>
                    <p className={styles.infoParagraph} data-loading>
                        The feature has been requested <b>0 times</b> and
                        exposed<b> 0 times</b> in the last hour
                    </p>
                </div>
                <FiberManualRecord
                    className={styles.icon}
                    style={{ transform: 'scale(1.1)' }}
                    data-loading
                />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.info}>
                <p className={styles.percentage}>{percentage}%</p>
                <p className={styles.infoParagraph}>
                    The feature has been requested{' '}
                    <b>{environmentMetric.yes + environmentMetric.no} times</b>{' '}
                    and exposed <b>{environmentMetric.yes} times</b> in the last
                    hour
                </p>
            </div>
            <PercentageCircle
                // @ts-expect-error
                className={styles.percentageCircle}
                percentage={percentage}
                data-loading
            />
        </div>
    );
};

export default FeatureOverviewEnvironmentMetrics;
