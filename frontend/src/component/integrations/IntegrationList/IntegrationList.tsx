import type { VFC } from 'react';
import useAddons from 'hooks/api/getters/useAddons/useAddons';
import { AvailableIntegrations } from './AvailableIntegrations/AvailableIntegrations.tsx';
import { ConfiguredIntegrations } from './ConfiguredIntegrations/ConfiguredIntegrations.tsx';
import { PageContent } from 'component/common/PageContent/PageContent';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { useSignalEndpoints } from 'hooks/api/getters/useSignalEndpoints/useSignalEndpoints';

export const IntegrationList: VFC = () => {
    const { signalEndpoints } = useSignalEndpoints();
    const { providers, addons, loading } = useAddons();

    return (
        <PageContent
            header={<PageHeader title='Integrations' />}
            isLoading={loading}
        >
            <ConditionallyRender
                condition={addons.length > 0 || signalEndpoints.length > 0}
                show={
                    <ConfiguredIntegrations
                        addons={addons}
                        providers={providers}
                        loading={loading}
                    />
                }
            />
            <AvailableIntegrations providers={providers} />
        </PageContent>
    );
};
