import { usePageTitle } from 'hooks/usePageTitle';
import { FeatureEnvironmentVariants } from './FeatureEnvironmentVariants/FeatureEnvironmentVariants';

const FeatureVariants = () => {
    usePageTitle('Variants');

    return <FeatureEnvironmentVariants />;
};

export default FeatureVariants;
