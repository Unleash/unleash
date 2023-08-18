import { ConfiguredAddons } from './ConfiguredAddons/ConfiguredAddons';
import { AvailableAddons } from './AvailableAddons/AvailableAddons';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import useAddons from 'hooks/api/getters/useAddons/useAddons';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { AvailableIntegrations } from './AvailableIntegrations/AvailableIntegrations';

export const IntegrationList = () => {
    const { providers, addons, loading } = useAddons();
    const { uiConfig } = useUiConfig();
    const integrationsRework = uiConfig?.flags?.integrationsRework || false;

    return (
        <>
            <ConditionallyRender
                condition={addons.length > 0}
                show={<ConfiguredAddons />}
            />
            <ConditionallyRender
                condition={integrationsRework}
                show={<AvailableIntegrations providers={providers} />}
                elseShow={
                    <AvailableAddons loading={loading} providers={providers} />
                }
            />
        </>
    );
};
