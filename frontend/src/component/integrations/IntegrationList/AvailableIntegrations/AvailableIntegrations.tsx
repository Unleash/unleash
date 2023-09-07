import { type VFC } from 'react';
import type { AddonTypeSchema } from 'openapi';
import useLoading from 'hooks/useLoading';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { IntegrationCard } from '../IntegrationCard/IntegrationCard';
import { StyledCardsGrid } from '../IntegrationList.styles';
import { JIRA_INFO } from '../../JiraIntegration/JiraIntegration';

interface IAvailableIntegrationsProps {
    providers: AddonTypeSchema[];
    loading?: boolean;
}

export const AvailableIntegrations: VFC<IAvailableIntegrationsProps> = ({
    providers,
    loading,
}) => {
    const customProviders = [JIRA_INFO];

    const ref = useLoading(loading || false);
    return (
        <PageContent
            header={<PageHeader title="Available integrations" />}
            isLoading={loading}
        >
            <StyledCardsGrid ref={ref}>
                {providers?.map(({ name, displayName, description }) => (
                    <IntegrationCard
                        key={name}
                        icon={name}
                        title={displayName || name}
                        description={description}
                        link={`/integrations/create/${name}`}
                    />
                ))}
                {customProviders?.map(({ name, displayName, description }) => (
                    <IntegrationCard
                        key={name}
                        icon={name}
                        title={displayName || name}
                        description={description}
                        link={`/integrations/view/${name}`}
                        configureActionText={'View integration'}
                    />
                ))}
            </StyledCardsGrid>
        </PageContent>
    );
};
