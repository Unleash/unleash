import { FeatureVariantsList } from './FeatureVariantsList/FeatureVariantsList';
import { usePageTitle } from 'hooks/usePageTitle';
import { FeatureEnvironmentVariants } from './FeatureEnvironmentVariants/FeatureEnvironmentVariants';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

const FeatureVariants = () => {
    usePageTitle('Variants');

    const { uiConfig } = useUiConfig();

    if (uiConfig.flags.variantsPerEnvironment) {
        return <FeatureEnvironmentVariants />;
    }

    return <FeatureVariantsList />;
};

export default FeatureVariants;
