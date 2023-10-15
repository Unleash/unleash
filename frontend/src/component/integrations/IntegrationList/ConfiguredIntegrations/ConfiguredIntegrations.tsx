import { AddonSchema, AddonTypeSchema } from 'openapi';
import useLoading from 'hooks/useLoading';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { StyledCardsGrid } from '../IntegrationList.styles';
import { IntegrationCard } from '../IntegrationCard/IntegrationCard';
import { VFC } from 'react';

type ConfiguredIntegrationsProps = {
    loading: boolean;
    addons: AddonSchema[];
    providers: AddonTypeSchema[];
};

export const ConfiguredIntegrations: VFC<ConfiguredIntegrationsProps> = ({
    loading,
    addons,
    providers,
}) => {
    const counter = addons.length ? `(${addons.length})` : '';
    const ref = useLoading(loading || false);

    return (
        <PageContent
            header={<PageHeader title={`Configured integrations ${counter}`} />}
            sx={(theme) => ({ marginBottom: theme.spacing(2) })}
            isLoading={loading}
        >
            <StyledCardsGrid ref={ref}>
                {addons
                    ?.sort(({ id: a }, { id: b }) => a - b)
                    .map((addon) => {
                        const {
                            id,
                            enabled,
                            provider,
                            description,
                            // events,
                            // projects,
                        } = addon;
                        const providerConfig = providers.find(
                            (item) => item.name === provider,
                        );

                        return (
                            <IntegrationCard
                                key={`${id}-${provider}-${enabled}`}
                                addon={addon}
                                icon={provider}
                                title={providerConfig?.displayName || provider}
                                isEnabled={enabled}
                                description={description || ''}
                                link={`/integrations/edit/${id}`}
                                configureActionText='Open'
                            />
                        );
                    })}
            </StyledCardsGrid>
        </PageContent>
    );
};
