import { VFC } from 'react';
import useAddons from 'hooks/api/getters/useAddons/useAddons';
import { AvailableIntegrations } from './AvailableIntegrations/AvailableIntegrations';
import { ConfiguredIntegrations } from './ConfiguredIntegrations/ConfiguredIntegrations';
import { PageContent } from 'component/common/PageContent/PageContent';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { PageHeader } from 'component/common/PageHeader/PageHeader';

export const IntegrationList: VFC = () => {
    const { providers, addons, loading } = useAddons();

    return (
        <PageContent
            header={<PageHeader title='Integrations' />}
            isLoading={loading}
        >
            <ConditionallyRender
                condition={addons.length > 0}
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
