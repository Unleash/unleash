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
            sx={theme => ({ marginBottom: theme.spacing(2) })}
            isLoading={loading}
        >
            <StyledCardsGrid ref={ref}>
                {addons?.map(
                    ({
                        id,
                        enabled,
                        provider,
                        description,
                        // events,
                        // projects,
                    }) => {
                        const providerConfig = providers.find(
                            item => item.name === provider
                        );

                        return (
                            <IntegrationCard
                                key={id}
                                id={id}
                                icon={provider}
                                title={providerConfig?.displayName || provider}
                                isEnabled={enabled}
                                description={description || ''}
                                isConfigured
                                link={`/integrations/edit/${id}`}
                            />
                        );
                    }
                )}
            </StyledCardsGrid>
        </PageContent>
    );
};
