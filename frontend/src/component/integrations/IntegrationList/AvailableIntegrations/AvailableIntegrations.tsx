import type { VFC } from 'react';
import { Box, Typography, styled } from '@mui/material';
import type { AddonTypeSchema } from 'openapi';
import { IntegrationCard } from '../IntegrationCard/IntegrationCard.tsx';
import { JIRA_INFO } from '../../ViewIntegration/JiraIntegration/JiraIntegration.tsx';
import { StyledCardsGrid } from '../IntegrationList.styles';
import { RequestIntegrationCard } from '../RequestIntegrationCard/RequestIntegrationCard.tsx';
import { OFFICIAL_SDKS } from './SDKs.ts';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useUiFlag } from 'hooks/useUiFlag';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

interface IAvailableIntegrationsProps {
    providers: AddonTypeSchema[];
}

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(8),
}));

const StyledSection = styled('section')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

const StyledSdksSection = styled('section')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(4),
}));

const StyledSdksGroup = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
}));

/**
 * @deprecated
 * // TODO: refactor
 */
const StyledGrayContainer = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.elevation1,
    borderRadius: theme.shape.borderRadiusLarge,
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
}));

export const AvailableIntegrations: VFC<IAvailableIntegrationsProps> = ({
    providers,
}) => {
    const { isEnterprise } = useUiConfig();
    const signalsEnabled = useUiFlag('signals');
    const filtered = providers?.filter((provider) => !provider.deprecated);

    const customProviders = [JIRA_INFO];
    const serverSdks = OFFICIAL_SDKS.filter((sdk) => sdk.type === 'server');
    const clientSdks = OFFICIAL_SDKS.filter((sdk) => sdk.type === 'client');

    return (
        <StyledContainer>
            <StyledSection>
                <div>
                    <Typography component='h3' variant='h2'>
                        Unleash crafted
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                        Unleash is built to be extended. We have crafted
                        integrations to make it easier for you to get started.
                    </Typography>
                </div>
                <StyledCardsGrid>
                    {filtered
                        ?.sort(
                            (a, b) =>
                                a.displayName?.localeCompare(b.displayName) ||
                                0,
                        )
                        .map(
                            ({
                                name,
                                displayName,
                                description,
                                deprecated,
                            }) => (
                                <IntegrationCard
                                    key={name}
                                    icon={name}
                                    title={displayName || name}
                                    description={description}
                                    link={`/integrations/create/${name}`}
                                    deprecated={deprecated}
                                />
                            ),
                        )}
                    <ConditionallyRender
                        condition={isEnterprise() && signalsEnabled}
                        show={
                            <IntegrationCard
                                icon='signals'
                                title='Signals'
                                description='Signal endpoints allow third-party services to send signals to Unleash.'
                                link='/integrations/signals'
                            />
                        }
                    />
                    {/* TODO: sort providers from backend with custom providers */}
                    {customProviders?.map(
                        ({ name, displayName, description }) => (
                            <IntegrationCard
                                key={name}
                                icon={name}
                                title={displayName || name}
                                description={description}
                                link={`/integrations/view/${name}`}
                                configureActionText='Learn more'
                            />
                        ),
                    )}
                    <IntegrationCard
                        icon='terraform'
                        title='Terraform'
                        description={`Manage Unleash with HashiCorp’s Terraform using infrastructure as code (IaC).`}
                        link='https://docs.getunleash.io/concepts/terraform'
                        configureActionText='View documentation'
                        isExternal
                    />
                    <RequestIntegrationCard />
                </StyledCardsGrid>
            </StyledSection>
            <StyledSection>
                <div>
                    <Typography component='h3' variant='h2'>
                        Performance and security
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                        Connect Unleash to private, scalable, and distributed
                        relays.
                    </Typography>
                </div>
                <StyledCardsGrid>
                    <IntegrationCard
                        icon='unleash'
                        title='Unleash Edge'
                        description="Unleash Edge is built to help you scale Unleash. As a successor of Unleash Proxy it's even faster and more versatile."
                        link='/integrations/view/edge'
                        configureActionText='Learn more'
                    />
                </StyledCardsGrid>
            </StyledSection>
            <StyledSection>
                <div>
                    <Typography component='h3' variant='h2'>
                        Official SDKs
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                        In order to connect your application to Unleash you will
                        need a client SDK (software developer kit) for your
                        programming language and an{' '}
                        <a
                            href='https://docs.getunleash.io/concepts/api-tokens-and-client-keys'
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            API token
                        </a>
                    </Typography>
                </div>
                <StyledSdksSection>
                    <StyledSdksGroup>
                        <Box>
                            <Typography component='h4' variant='h4'>
                                Backend SDKs
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                                Backend clients run on your server and
                                communicate directly with your Unleash instance.
                            </Typography>
                        </Box>
                        <StyledCardsGrid small>
                            {serverSdks?.map(
                                ({
                                    name,
                                    displayName,
                                    description,
                                    documentationUrl,
                                }) => (
                                    <IntegrationCard
                                        key={name}
                                        icon={name}
                                        title={displayName || name}
                                        description={description}
                                        link={documentationUrl}
                                        configureActionText={
                                            'View documentation'
                                        }
                                        isExternal
                                    />
                                ),
                            )}
                        </StyledCardsGrid>
                    </StyledSdksGroup>
                    <StyledSdksGroup>
                        <Box>
                            <Typography component='h4' variant='h4'>
                                Frontend SDKs
                            </Typography>
                            <Typography variant='body2' color='text.secondary'>
                                Frontend SDKs can connect to the{' '}
                                <a
                                    href='https://docs.getunleash.io/unleash-edge'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                >
                                    Unleash Edge
                                </a>{' '}
                                or to the{' '}
                                <a
                                    href='https://docs.getunleash.io/concepts/front-end-api'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                >
                                    Unleash Frontend API
                                </a>
                                , but not to the regular Unleash Client API.
                            </Typography>
                        </Box>
                        <StyledCardsGrid small>
                            {clientSdks?.map(
                                ({
                                    name,
                                    displayName,
                                    description,
                                    documentationUrl,
                                }) => (
                                    <IntegrationCard
                                        key={name}
                                        icon={name}
                                        title={displayName || name}
                                        description={description}
                                        link={documentationUrl}
                                        configureActionText={
                                            'View documentation'
                                        }
                                        isExternal
                                    />
                                ),
                            )}
                        </StyledCardsGrid>
                    </StyledSdksGroup>
                    <StyledSdksGroup>
                        <StyledGrayContainer>
                            <div>
                                <Typography component='h4' variant='h3'>
                                    Community SDKs
                                </Typography>
                                <Typography>
                                    <a
                                        href='https://docs.getunleash.io/sdks#community-sdks'
                                        target='_blank'
                                        rel='noopener noreferrer'
                                    >
                                        Here's some of the fantastic work
                                    </a>{' '}
                                    our community has built to make Unleash work
                                    in even more contexts.
                                </Typography>
                            </div>
                        </StyledGrayContainer>
                    </StyledSdksGroup>
                </StyledSdksSection>
            </StyledSection>
        </StyledContainer>
    );
};
