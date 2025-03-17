import { createContext, useCallback, useContext, useState } from 'react';

interface ICollapsedStrategiesContextProps {
    collapsedStrategies: Set<string>;
    collapseStrategy: (strategyId: string) => void;
    expandStrategy: (strategyId: string) => void;
}

const CollapsedStrategiesContext = createContext({} as ICollapsedStrategiesContextProps);

export const useCollapsedStrategies = () => {
    return useContext(CollapsedStrategiesContext);
}

export const CollapsedStrategiesProvider = ({ children }: Readonly<{ children: React.ReactNode }>) => {
    const [collapsedStrategies, setCollapsedStrategies] = useState(new Set<string>());

    const collapseStrategy = useCallback((strategyId: string) => {
        setCollapsedStrategies(prev => new Set(prev).add(strategyId));
    }, []);

    const expandStrategy = useCallback((strategyId: string) => {
        setCollapsedStrategies(prev => {
            const newSet = new Set(prev);
            newSet.delete(strategyId);
            return newSet;
        });
    }, []);

    const value = {
        collapsedStrategies,
        collapseStrategy,
        expandStrategy,
    };

    return (
        <CollapsedStrategiesContext.Provider value={value}>
            {children}
        </CollapsedStrategiesContext.Provider>
    );
}
