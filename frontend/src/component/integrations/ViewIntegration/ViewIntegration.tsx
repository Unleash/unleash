import type { FC } from 'react';
import { useParams } from 'react-router-dom';
import NotFound from 'component/common/NotFound/NotFound';
import { JiraIntegration } from './JiraIntegration/JiraIntegration.tsx';
import { EdgeIntegration } from './EdgeIntegration/EdgeIntegration.tsx';

type IViewIntegrationProps = {};

export const ViewIntegration: FC<IViewIntegrationProps> = () => {
    const { providerId } = useParams<{ providerId: string }>();

    if (providerId === 'jira') {
        return <JiraIntegration />;
    }

    if (providerId === 'edge') {
        return <EdgeIntegration />;
    }

    return <NotFound />;
};
