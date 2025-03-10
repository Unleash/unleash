import { createContext, useContext, type ReactNode, type FC } from 'react';
import useWorkspace from '../hooks/useWorkspace';
import type { IWorkspace } from '../interfaces/workspace';

interface IWorkspaceContext {
    workspaces: IWorkspace[];
    currentWorkspace: IWorkspace | null;
    currentWorkspaceId: number | null;
    setWorkspace: (workspaceId: number) => void;
    loading: boolean;
}

const WorkspaceContext = createContext<IWorkspaceContext | undefined>(
    undefined,
);

export const WorkspaceProvider: FC<{ children: ReactNode }> = ({
    children,
}) => {
    const workspaceData = useWorkspace();

    console.log('WORKSPACE DATA', workspaceData);

    return (
        <WorkspaceContext.Provider value={workspaceData}>
            {children}
        </WorkspaceContext.Provider>
    );
};

export const useWorkspaceContext = (): IWorkspaceContext => {
    const context = useContext(WorkspaceContext);
    if (context === undefined) {
        throw new Error(
            'useWorkspaceContext must be used within a WorkspaceProvider',
        );
    }
    return context;
};
