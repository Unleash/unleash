import { useContext } from 'react';
import { FloatingOnboardingChecklistContext } from './FloatingOnboardingChecklistContext.tsx';

export const useFloatingOnboardingChecklist = () => {
    const context = useContext(FloatingOnboardingChecklistContext);
    if (!context) {
        throw new Error(
            'useFloatingOnboardingChecklist must be used within a FloatingOnboardingChecklistProvider (and only when the user is eligible)',
        );
    }
    return context;
};
