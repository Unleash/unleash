import { AddonSchema, AddonTypeSchema } from 'openapi';
import useLoading from 'hooks/useLoading';
import { StyledCardsGrid } from '../IntegrationList.styles';
import { IntegrationCard } from '../IntegrationCard/IntegrationCard';
import { VFC } from 'react';
import { Typography, styled } from '@mui/material';

const StyledSection = styled('section')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

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
    const ref = useLoading(loading || false);

    return (
        <StyledSection sx={(theme) => ({ marginBottom: theme.spacing(8) })}>
            <div>
                <Typography component='h3' variant='h2'>
                    Configured integrations
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                    These are the integrations that are currently configured for
                    your Unleash instance.
                </Typography>
            </div>
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
        </StyledSection>
    );
};
