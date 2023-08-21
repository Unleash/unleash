import { ConfiguredAddons } from './ConfiguredAddons/ConfiguredAddons';
import { AvailableAddons } from './AvailableAddons/AvailableAddons';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useAddons from 'hooks/api/getters/useAddons/useAddons';

/**
 * @deprecated remove with `integrationsRework` flag
 */
export const AddonsList = () => {
    const { providers, addons, loading } = useAddons();

    return (
        <>
            <ConditionallyRender
                condition={addons.length > 0}
                show={<ConfiguredAddons />}
            />
            <AvailableAddons loading={loading} providers={providers} />
        </>
    );
};
