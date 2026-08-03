import { useContext } from 'react';
import AccessContext from 'contexts/AccessContext';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import { useUiFlag } from 'hooks/useUiFlag';

// Server-persisted splash key: user has dismissed the checklist.
export const ONBOARDING_CHECKLIST_SPLASH_ID = 'onboarding-checklist';

// Server-persisted splash key: user has completed the intro tour.
export const ONBOARDING_TOUR_SPLASH_ID = 'onboarding-tour';

// Heuristic: admin AND `id === 1` — the initial admin auto-created by
// `initAdminUser` on a fresh install. Cheap: both signals are already loaded
// on app boot. Limitation: if that user was deleted, the checklist stops
// showing on the instance; acceptable because mature instances are past
// onboarding. Swap this hook when the heuristic outgrows itself.
export const useOnboardingChecklistEligibility = (): boolean => {
    const flagEnabled = useUiFlag('floatingOnboardingChecklist');
    const { isAdmin } = useContext(AccessContext);
    const { user, loading } = useAuthUser();
    if (!flagEnabled) return false;
    if (loading || user === undefined) return false;
    return isAdmin && user.id === 1;
};
