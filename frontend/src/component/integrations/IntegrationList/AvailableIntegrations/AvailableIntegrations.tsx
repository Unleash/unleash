import { type VFC } from 'react';
import type { AddonTypeSchema } from 'openapi';
import { PageContent } from 'component/common/PageContent/PageContent';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { IntegrationCard } from '../IntegrationCard/IntegrationCard';
import { styled } from '@mui/material';

interface IAvailableIntegrationsProps {
    providers: AddonTypeSchema[];
}

const StyledGrid = styled('div')(({ theme }) => ({
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: theme.spacing(2),
    display: 'grid',
}));

export const AvailableIntegrations: VFC<IAvailableIntegrationsProps> = ({
    providers,
}) => {
    return (
        <PageContent header={<PageHeader title="Available integrations" />}>
            <StyledGrid>
                {providers?.map(({ name, displayName, description }) => (
                    <IntegrationCard
                        key={name}
                        title={displayName || name}
                        description={description}
                    />
                ))}
            </StyledGrid>
        </PageContent>
    );
};
