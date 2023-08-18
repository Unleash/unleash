import React from 'react';
import { ConfiguredIntegrations } from './ConfiguredIntegrations/ConfiguredIntegrations';
import { AvailableIntegrations } from './AvailableIntegrations/AvailableIntegrations';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useAddons from 'hooks/api/getters/useAddons/useAddons';

export const IntegrationList = () => {
    const { providers, addons, loading } = useAddons();

    return (
        <>
            <ConditionallyRender
                condition={addons.length > 0}
                show={<ConfiguredIntegrations />}
            />
            <AvailableIntegrations loading={loading} providers={providers} />
        </>
    );
};
