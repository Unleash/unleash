import { useState, useEffect, useCallback } from 'react';
import useWorkspaces from './api/getters/useWorkspaces/useWorkspaces';

const LOCAL_STORAGE_KEY = 'unleash-workspace-id';

export const useWorkspace = () => {
    const { workspaces, loading: workspacesLoading } = useWorkspaces();
    const [currentWorkspaceId, setCurrentWorkspaceId] = useState<number | null>(
        null,
    );
    const [loading, setLoading] = useState(true);

    // Load the workspace ID from local storage on initial render
    useEffect(() => {
        const storedWorkspaceId = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedWorkspaceId) {
            setCurrentWorkspaceId(Number(storedWorkspaceId));
        }
        setLoading(false);
    }, []);

    // If no workspace is selected and workspaces are loaded, select the first one
    useEffect(() => {
        if (
            !workspacesLoading &&
            workspaces.length > 0 &&
            currentWorkspaceId === null
        ) {
            setCurrentWorkspaceId(workspaces[0].id);
        }
    }, [workspaces, workspacesLoading, currentWorkspaceId]);

    // Save the workspace ID to local storage when it changes
    useEffect(() => {
        if (currentWorkspaceId !== null) {
            localStorage.setItem(
                LOCAL_STORAGE_KEY,
                currentWorkspaceId.toString(),
            );
        }
    }, [currentWorkspaceId]);

    const setWorkspace = useCallback((workspaceId: number) => {
        setCurrentWorkspaceId(workspaceId);
    }, []);

    const currentWorkspace =
        workspaces.find((w) => w.id === currentWorkspaceId) || null;

    return {
        workspaces,
        currentWorkspace,
        currentWorkspaceId,
        setWorkspace,
        loading: loading || workspacesLoading,
    };
};

export default useWorkspace;
