import { type VFC } from 'react';
import type { AddonTypeSchema } from 'openapi';
import useLoading from 'hooks/useLoading';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { IntegrationCard } from '../IntegrationCard/IntegrationCard';
import { JIRA_INFO } from '../../JiraIntegration/JiraIntegration';
import { StyledCardsGrid } from '../IntegrationList.styles';
import { Paper, Typography, styled } from '@mui/material';
import { RequestIntegrationCard } from '../RequestIntegrationCard/RequestIntegrationCard';

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
                        <RequestIntegrationCard />
                    </StyledCardsGrid>
                </StyledSection>
                <StyledSection>
                    <div>
                        <Typography component="h3" variant="h2">
                            Performance and security
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Description
                        </Typography>
                    </div>
                    <StyledCardsGrid small>
                        {/* TODO: edge and proxy */}
                        {/* {providers?.map(
                            ({ name, displayName, description }) => (
                                <IntegrationCard
                                    key={name}
                                    icon={name}
                                    title={displayName || name}
                                    description={description}
                                    link={`/integrations/create/${name}`}
                                />
                            )
                        )} */}
                    </StyledCardsGrid>
                </StyledSection>
                <StyledSection>
                    <StyledGrayContainer>
                        <div>
                            <Typography component="h3" variant="h2">
                                Other
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
