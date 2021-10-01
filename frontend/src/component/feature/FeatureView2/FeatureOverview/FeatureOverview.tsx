import FeatureViewMetaData from './FeatureViewMetaData/FeatureViewMetaData';
import FeatureOverviewStrategies from './FeatureOverviewStrategies/FeatureOverviewStrategies';
import { useStyles } from './FeatureOverview.styles';
import FeatureOverviewTags from './FeatureOverviewTags/FeatureOverviewTags';

const FeatureOverview = () => {
    const styles = useStyles();
    return (
        <div className={styles.container}>
            <div className={styles.sidebar}>
                <FeatureViewMetaData />
                <FeatureOverviewTags />
            </div>
            <div className={styles.mainContent}>
                <FeatureOverviewStrategies />
            </div>
        </div>
    );
};

export default FeatureOverview;
