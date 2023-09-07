import { type VFC } from 'react';
import type { AddonTypeSchema } from 'openapi';
import useLoading from 'hooks/useLoading';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { IntegrationCard } from '../IntegrationCard/IntegrationCard';
import { StyledCardsGrid } from '../IntegrationList.styles';
import { IntegrationsSection } from './IntegrationsSection';

interface IAvailableIntegrationsProps {
    providers: AddonTypeSchema[];
    loading?: boolean;
}
export const AvailableIntegrations: VFC<IAvailableIntegrationsProps> = ({
    providers,
    loading,
}) => {
    const ref = useLoading(loading || false);
    return (
        <PageContent
            header={<PageHeader title="Integrations" />}
            isLoading={loading}
        >
            <IntegrationsSection>
                {providers?.map(({ name, displayName, description }) => (
                    <IntegrationCard
                        key={name}
                        icon={name}
                        title={displayName || name}
                        description={description}
                        link={`/integrations/create/${name}`}
                    />
                ))}
            </IntegrationsSection>
        </PageContent>
    );
};
