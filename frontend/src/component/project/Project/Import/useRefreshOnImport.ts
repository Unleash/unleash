import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';
import { useState } from 'react';

export const useRefreshOnImport = (projectId: string) => {
    const { refetch: refreshChangeRequests } =
        usePendingChangeRequests(projectId);
    const [projectKey, setProjectKey] = useState(projectId);
    const refreshProjectOverviewKey = () => {
        setProjectKey(projectId + Date.now());
    };
    const refreshOnImport = () => {
        refreshChangeRequests();
        refreshProjectOverviewKey();
    };
    return { refreshOnImport, projectKey };
};
