import { createContext, useContext, type ReactNode } from 'react';

interface PendingProgressionChange {
    action: string;
    payload: any;
    changeRequestId: number;
}

interface ReleasePlanContextType {
    getPendingProgressionChange: (
        sourceMilestoneId: string,
    ) => PendingProgressionChange | null;
}

const ReleasePlanContext = createContext<ReleasePlanContextType | null>(null);

export const useReleasePlanContext = () => {
    const context = useContext(ReleasePlanContext);
    if (!context) {
        // Return a fallback context that returns null for all milestone IDs
        // This allows the component to work without the provider (e.g., in change request views)
        return {
            getPendingProgressionChange: () => null,
        };
    }
    return context;
};

interface ReleasePlanProviderProps {
    children: ReactNode;
    getPendingProgressionChange: (
        sourceMilestoneId: string,
    ) => PendingProgressionChange | null;
}

export const ReleasePlanProvider = ({
    children,
    getPendingProgressionChange,
}: ReleasePlanProviderProps) => {
    return (
        <ReleasePlanContext.Provider value={{ getPendingProgressionChange }}>
            {children}
        </ReleasePlanContext.Provider>
    );
};
