import { useStyles } from './FeatureVariants.styles';
import FeatureOverviewVariants from './FeatureVariantsList/FeatureVariantsList';
import { usePageTitle } from 'hooks/usePageTitle';

const FeatureVariants = () => {
    usePageTitle('Variants');

    const { classes: styles } = useStyles();

    return (
        <div className={styles.container}>
            <FeatureOverviewVariants />
        </div>
    );
};

export default FeatureVariants;
