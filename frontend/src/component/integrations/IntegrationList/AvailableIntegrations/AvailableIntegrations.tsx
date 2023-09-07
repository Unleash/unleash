import { type VFC } from 'react';
import type { AddonTypeSchema } from 'openapi';
import useLoading from 'hooks/useLoading';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { IntegrationCard } from '../IntegrationCard/IntegrationCard';
import { JIRA_INFO } from '../../JiraIntegration/JiraIntegration';
import { StyledCardsGrid } from '../IntegrationList.styles';
import { Typography, styled } from '@mui/material';

interface IAvailableIntegrationsProps {
    providers: AddonTypeSchema[];
    loading?: boolean;
}

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(12),
}));

const StyledSection = styled('section')(({ theme }) => ({
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
    loading,
}) => {
    const customProviders = [JIRA_INFO];

    const ref = useLoading(loading || false);

    return (
        <PageContent
            header={<PageHeader title="Integrations" secondary />}
            isLoading={loading}
            ref={ref}
        >
            <StyledContainer>
                <StyledSection>
                    <div>
                        <Typography component="h3" variant="h2">
                            Title
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Description
                        </Typography>
                    </div>
                    <StyledCardsGrid>
                        {providers?.map(
                            ({ name, displayName, description }) => (
                                <IntegrationCard
                                    key={name}
                                    icon={name}
                                    title={displayName || name}
                                    description={description}
                                    link={`/integrations/create/${name}`}
                                />
                            )
                        )}
                        {customProviders?.map(
                            ({ name, displayName, description }) => (
                                <IntegrationCard
                                    key={name}
                                    icon={name}
                                    title={displayName || name}
                                    description={description}
                                    link={`/integrations/view/${name}`}
                                    configureActionText={'View integration'}
                                />
                            )
                        )}
                    </StyledCardsGrid>
                </StyledSection>
                <StyledSection>
                    <div>
                        <Typography component="h3" variant="h2">
                            Performance and security
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {/* scale */}
                            Connect Unleash to private, scalable and distributed
                            relays. Additional layer for handling massive number
                            of requests.
                        </Typography>
                    </div>
                    <StyledCardsGrid>
                        <IntegrationCard
                            icon="unleash"
                            title="Unleash Edge"
                            description="Unleash Edge is built to help you scale Unleash. As a successor of Unleash Proxy it's even faster and more versitile."
                            link="/integrations/create/unleash-proxy"
                            configureActionText="Learn more"
                        />
                        <IntegrationCard
                            icon="unleash"
                            title="Unleash Proxy"
                            description="The Unleash Proxy is a lightweight, stateless proxy that sits between your Unleash client SDKs and the Unleash API."
                            link="/integrations/create/unleash-proxy"
                            configureActionText="View documentation"
                            deprecated="Try Unleash Edge instead. It has all the features of Unleash Proxy and more."
                        />
                    </StyledCardsGrid>
                </StyledSection>
                <StyledSection>
                    <StyledGrayContainer>
                        <div>
                            <Typography component="h3" variant="h2">
                                Community SDKs
                            </Typography>
                            <Typography>
                                <a
                                    href="https://docs.getunleash.io/reference/sdks#community-sdks"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Here's some of the fantastic work
                                </a>{' '}
                                our community has build to make Unleash work in
                                even more contexts.
                            </Typography>
                        </div>
                    </StyledGrayContainer>
                </StyledSection>
            </StyledContainer>
        </PageContent>
    );
};
