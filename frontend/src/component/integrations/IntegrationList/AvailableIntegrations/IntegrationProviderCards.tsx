import type { FC } from 'react';
import type { AddonTypeSchema } from 'openapi';
import { IntegrationCard } from '../IntegrationCard/IntegrationCard.tsx';
import { formatIntegrationCreatePath } from 'component/integrations/integrationPaths';

interface IIntegrationProviderCardsProps {
    providers: AddonTypeSchema[];
    projectId?: string;
}

export const IntegrationProviderCards: FC<IIntegrationProviderCardsProps> = ({
    providers,
    projectId,
}) => (
    <>
        {providers
            ?.sort((a, b) => a.displayName?.localeCompare(b.displayName) || 0)
            .map(({ name, displayName, description, deprecated }) => (
                <IntegrationCard
                    key={name}
                    icon={name}
                    title={displayName || name}
                    description={description}
                    link={formatIntegrationCreatePath(name, projectId)}
                    deprecated={deprecated}
                />
            ))}
    </>
);
