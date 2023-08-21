import { VFC } from 'react';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useAddons from 'hooks/api/getters/useAddons/useAddons';
import { AvailableIntegrations } from './AvailableIntegrations/AvailableIntegrations';
import { ConfiguredIntegrations } from './ConfiguredIntegrations/ConfiguredIntegrations';
import { AddonSchema } from 'openapi';

export const IntegrationList: VFC = () => {
    const { providers, addons, loading } = useAddons();

    const loadingPlaceholderAddons: AddonSchema[] = Array.from({ length: 4 })
        .fill({})
        .map((_, id) => ({
            id,
            provider: 'mock',
            description: 'mock integratino',
            events: [],
            projects: [],
            parameters: {},
            enabled: false,
        }));

    return (
        <>
            <ConditionallyRender
                condition={addons.length > 0}
                show={
                    <ConfiguredIntegrations
                        addons={loading ? loadingPlaceholderAddons : addons}
                        providers={providers}
                        loading={loading}
                    />
                }
            />
            <AvailableIntegrations providers={providers} loading={loading} />
        </>
    );
};
