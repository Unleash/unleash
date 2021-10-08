import { useStyles } from './FeatureVariants.styles';
import FeatureOverviewVariants from './FeatureVariantsList/FeatureVariantsList';

const FeatureVariants = () => {
    const styles = useStyles();

    return (
        <div className={styles.container}>
            <FeatureOverviewVariants />
        </div>
    );
};

export default FeatureVariants;
