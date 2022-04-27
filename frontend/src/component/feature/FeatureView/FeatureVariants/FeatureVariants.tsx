import { useStyles } from './FeatureVariants.styles';
import FeatureOverviewVariants from './FeatureVariantsList/FeatureVariantsList';
import { usePageTitle } from 'hooks/usePageTitle';

const FeatureVariants = () => {
    const styles = useStyles();
    usePageTitle('Variants');

    return (
        <div className={styles.container}>
            <FeatureOverviewVariants />
        </div>
    );
};

export default FeatureVariants;
