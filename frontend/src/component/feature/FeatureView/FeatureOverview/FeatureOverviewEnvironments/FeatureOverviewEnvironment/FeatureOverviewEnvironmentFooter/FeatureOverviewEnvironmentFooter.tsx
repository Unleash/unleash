import {
    IFeatureEnvironment,
    IFeatureEnvironmentMetrics,
} from '../../../../../../../interfaces/featureToggle';
import { calculatePercentage } from '../../../../../../../utils/calculate-percentage';
import { useStyles } from '../FeatureOverviewEnvironment.styles';

interface IFeatureOverviewEnvironmentFooterProps {
    env: IFeatureEnvironment;
    environmentMetric?: IFeatureEnvironmentMetrics;
}

const FeatureOverviewEnvironmentFooter = ({
    env,
    environmentMetric,
}: IFeatureOverviewEnvironmentFooterProps) => {
    const styles = useStyles();

    if (!environmentMetric) return null;
    const totalTraffic = environmentMetric.yes + environmentMetric.no;

    return (
        <>
            <div className={styles.resultInfo}>
                <div className={styles.leftWing} />
                <div className={styles.separatorText}>Result</div>
                <div className={styles.rightWing} />
            </div>

            <div className={styles.accordionBodyFooter}>
                <div className={styles.resultContainer}>
                    <div className={styles.dataContainer}>
                        <h3 className={styles.resultTitle}>Exposure</h3>
                        <div className={styles.percentageContainer}>
                            {environmentMetric?.yes}
                        </div>
                        <p className={styles.requestText}>
                            Total exposure of the feature in the environment in
                            the last hour
                        </p>
                    </div>
                    <div className={styles.dataContainer}>
                        <h3 className={styles.resultTitle}>% exposure</h3>
                        <div className={styles.percentageContainer}>
                            {calculatePercentage(
                                totalTraffic,
                                environmentMetric?.yes
                            )}
                            %
                        </div>
                        <p className={styles.requestText}>
                            Total exposure of the feature in the environment in
                            the last hour
                        </p>
                    </div>
                    <div className={styles.dataContainer}>
                        <h3 className={styles.resultTitle}>Total requests</h3>
                        <div className={styles.percentageContainer}>
                            {environmentMetric?.yes + environmentMetric?.no}
                        </div>
                        <p className={styles.requestText}>
                            The total request of the feature in the environment
                            in the last hour
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FeatureOverviewEnvironmentFooter;
