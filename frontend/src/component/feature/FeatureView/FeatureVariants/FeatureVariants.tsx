import { FeatureVariantsList } from './FeatureVariantsList/FeatureVariantsList';
import { usePageTitle } from 'hooks/usePageTitle';
import { FeatureEnvironmentVariantsList } from './FeatureVariantsList/FeatureEnvironmentVariantsList';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

const FeatureVariants = () => {
    usePageTitle('Variants');

    const { uiConfig } = useUiConfig();

    if (uiConfig.flags.variantsPerEnvironment) {
        return <FeatureEnvironmentVariantsList />;
    }

    return <FeatureVariantsList />;
};

export default FeatureVariants;
