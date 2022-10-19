import { FiberManualRecord } from '@mui/icons-material';
import { useTheme } from '@mui/system';
import { IFeatureEnvironmentMetrics } from 'interfaces/featureToggle';
import { calculatePercentage } from 'utils/calculatePercentage';
import PercentageCircle from 'component/common/PercentageCircle/PercentageCircle';
import { useStyles } from './FeatureOverviewEnvironmentMetrics.styles';
import { PrettifyLargeNumber } from 'component/common/PrettifyLargeNumber/PrettifyLargeNumber';

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
                    <b>
                        <PrettifyLargeNumber value={total} /> times
                    </b>{' '}
                    and exposed{' '}
                    <b>
                        <PrettifyLargeNumber value={environmentMetric.yes} />{' '}
                        times
                    </b>{' '}
                    in the last hour
                </p>
            </div>
            <div className={styles.percentageCircle} data-loading>
                <PercentageCircle percentage={percentage} size="3rem" />
            </div>
        </div>
    );
};

export default FeatureOverviewEnvironmentMetrics;
