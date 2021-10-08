import FeatureOverviewMetaData from './FeatureOverviewMetaData/FeatureOverviewMetaData';
import FeatureOverviewStrategies from './FeatureOverviewStrategies/FeatureOverviewStrategies';
import FeatureOverviewTags from './FeatureOverviewTags/FeatureOverviewTags';
import FeatureViewStale from './FeatureOverviewStale/FeatureOverviewStale';

import { useStyles } from './FeatureOverview.styles';
import FeatureOverviewMetrics from './FeatureOverviewMetrics/FeatureOverviewMetrics';

const FeatureOverview = () => {
    const styles = useStyles();

    return (
        <div className={styles.container}>
            <div>
                <FeatureOverviewMetaData />
                <FeatureViewStale />
                <FeatureOverviewTags />
            </div>
            <div className={styles.mainContent}>
                <div className={styles.trafficContainer}>
                    <FeatureOverviewMetrics />
                </div>
                <FeatureOverviewStrategies />
            </div>
        </div>
    );
};

export default FeatureOverview;
