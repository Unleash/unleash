import { VFC } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useAddons from 'hooks/api/getters/useAddons/useAddons';
import { AvailableIntegrations } from './AvailableIntegrations/AvailableIntegrations';
import { ConfiguredIntegrations } from './ConfiguredIntegrations/ConfiguredIntegrations';

export const IntegrationList: VFC = () => {
    const { providers, addons, loading } = useAddons();

    return (
        <>
            <ConditionallyRender
                condition={addons.length > 0}
                show={<ConfiguredIntegrations />}
            />
            <AvailableIntegrations providers={providers} />
        </>
    );
};
