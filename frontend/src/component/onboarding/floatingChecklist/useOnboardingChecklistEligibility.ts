import { useContext } from 'react';
import AccessContext from 'contexts/AccessContext';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import { useUiFlag } from 'hooks/useUiFlag';

export const ONBOARDING_CHECKLIST_SPLASH_ID = 'onboarding-checklist';

// `id === 1` is the initial admin from `initAdminUser` on a fresh install —
// a "new instance" proxy.
export const useOnboardingChecklistEligibility = (): boolean => {
    const flagEnabled = useUiFlag('floatingOnboardingChecklist');
    const { isAdmin } = useContext(AccessContext);
    const { user, loading } = useAuthUser();
    if (!flagEnabled) return false;
    if (loading || user === undefined) return false;
    return isAdmin && user.id === 1;
};
