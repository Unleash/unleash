import { createContext, type FC, type ReactNode } from 'react';
import {
    type FloatingOnboardingChecklistContextValue,
    useChecklistContextValue,
} from './useChecklistContextValue.ts';

export const FloatingOnboardingChecklistContext =
    createContext<FloatingOnboardingChecklistContextValue | null>(null);

export const FloatingOnboardingChecklistProvider: FC<{
    children: ReactNode;
}> = ({ children }) => {
    const value = useChecklistContextValue();
    return (
        <FloatingOnboardingChecklistContext.Provider value={value}>
            {children}
        </FloatingOnboardingChecklistContext.Provider>
    );
};
