import { VFC } from 'react';
import { useParams } from 'react-router-dom';
import NotFound from 'component/common/NotFound/NotFound';
import { JiraIntegration } from './JiraIntegration/JiraIntegration';
import { EdgeIntegration } from './EdgeIntegration/EdgeIntegration';

type IViewIntegrationProps = {};

export const ViewIntegration: VFC<IViewIntegrationProps> = () => {
    const { providerId } = useParams<{ providerId: string }>();

    if (providerId === 'jira') {
        return <JiraIntegration />;
    }

    if (providerId === 'edge') {
        return <EdgeIntegration />;
    }

    return <NotFound />;
};
