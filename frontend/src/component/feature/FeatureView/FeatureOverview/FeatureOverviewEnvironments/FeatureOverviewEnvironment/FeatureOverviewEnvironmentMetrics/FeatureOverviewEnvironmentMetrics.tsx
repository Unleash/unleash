import { FiberManualRecord } from '@mui/icons-material';
import { useTheme } from '@mui/system';
import { IFeatureEnvironmentMetrics } from 'interfaces/featureToggle';
import { calculatePercentage } from 'utils/calculatePercentage';
import PercentageCircle from 'component/common/PercentageCircle/PercentageCircle';
import { useStyles } from './FeatureOverviewEnvironmentMetrics.styles';

interface IFeatureOverviewEnvironmentMetrics {
    environmentMetric?: IFeatureEnvironmentMetrics;
    disabled?: boolean;
}

const FeatureOverviewEnvironmentMetrics = ({
    environmentMetric,
    disabled = false,
}: IFeatureOverviewEnvironmentMetrics) => {
    const { classes: styles } = useStyles();
    const theme = useTheme();

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
                    <p
                        className={styles.percentage}
                        style={{
                            color: disabled
                                ? theme.palette.text.secondary
                                : undefined,
                        }}
                        data-loading
                    >
                        {percentage}%
                    </p>
                    <p
                        className={styles.infoParagraph}
                        style={{
                            color: disabled
                                ? theme.palette.text.secondary
                                : theme.palette.text.primary,
                        }}
                        data-loading
                    >
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
                className={styles.percentageCircle}
                percentage={percentage}
                data-loading
            />
        </div>
    );
};

export default FeatureOverviewEnvironmentMetrics;
