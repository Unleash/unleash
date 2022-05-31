import { FeatureVariantsList } from './FeatureVariantsList/FeatureVariantsList';
import { usePageTitle } from 'hooks/usePageTitle';

const FeatureVariants = () => {
    usePageTitle('Variants');

    return <FeatureVariantsList />;
};

export default FeatureVariants;
