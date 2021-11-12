import { Warning } from '@material-ui/icons';
import {
    IFeatureEnvironment,
    IFeatureEnvironmentMetrics,
} from '../../../../../../../interfaces/featureToggle';
import { calculatePercentage } from '../../../../../../../utils/calculate-percentage';
import ConditionallyRender from '../../../../../../common/ConditionallyRender';
import FeatureEnvironmentMetrics from '../../../FeatureEnvironmentMetrics/FeatureEnvironmentMetrics';

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
                <ConditionallyRender
                    condition={env.enabled}
                    show={
                        <FeatureEnvironmentMetrics metric={environmentMetric} />
                    }
                    elseShow={
                        <div className={styles.disabledInfo}>
                            <Warning className={styles.disabledIcon} />
                            <p>
                                As long as the environment is disabled, all
                                requests made for this feature toggle will
                                return false. Add a strategy and turn on the
                                environment to enable it for your users.
                            </p>
                        </div>
                    }
                />

                <div className={styles.requestContainer}>
                    Total requests {totalTraffic}
                    <div className={styles.percentageContainer}>
                        {calculatePercentage(
                            totalTraffic,
                            environmentMetric?.yes
                        )}
                        %
                    </div>
                    <p className={styles.requestText}>
                        Received enabled for this feature in this environment in
                        the last hour.
                    </p>
                </div>
            </div>
        </>
    );
};

export default FeatureOverviewEnvironmentFooter;
