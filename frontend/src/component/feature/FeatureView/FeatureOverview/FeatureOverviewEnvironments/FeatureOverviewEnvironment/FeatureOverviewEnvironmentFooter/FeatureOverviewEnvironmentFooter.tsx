import { IFeatureEnvironmentMetrics } from 'interfaces/featureToggle';
import { useStyles } from '../FeatureOverviewEnvironment.styles';
import { FeatureMetricsStats } from 'component/feature/FeatureView/FeatureMetrics/FeatureMetricsStats/FeatureMetricsStats';

interface IFeatureOverviewEnvironmentFooterProps {
    environmentMetric?: IFeatureEnvironmentMetrics;
}

const FeatureOverviewEnvironmentFooter = ({
    environmentMetric,
}: IFeatureOverviewEnvironmentFooterProps) => {
    const styles = useStyles();

    if (!environmentMetric) {
        return null;
    }

    return (
        <>
            <div className={styles.resultInfo}>
                <div className={styles.leftWing} />
                <div className={styles.separatorText}>Result</div>
                <div className={styles.rightWing} />
            </div>
            <div>
                <FeatureMetricsStats
                    totalYes={environmentMetric.yes}
                    totalNo={environmentMetric.no}
                    hoursBack={1}
                />
            </div>
        </>
    );
};
export default FeatureOverviewEnvironmentFooter;
