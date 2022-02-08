import FeatureOverviewMetaData from './FeatureOverviewMetaData/FeatureOverviewMetaData';

import { useStyles } from './FeatureOverview.styles';
import FeatureOverviewEnvironments from './FeatureOverviewEnvironments/FeatureOverviewEnvironments';
import FeatureOverviewEnvSwitches from './FeatureOverviewEnvSwitches/FeatureOverviewEnvSwitches';

const FeatureOverview = () => {
    const styles = useStyles();

    return (
        <div className={styles.container}>
            <div>
                <FeatureOverviewMetaData />
                <FeatureOverviewEnvSwitches />
            </div>
            <div className={styles.mainContent}>
                <FeatureOverviewEnvironments />
            </div>
        </div>
    );
};

export default FeatureOverview;
