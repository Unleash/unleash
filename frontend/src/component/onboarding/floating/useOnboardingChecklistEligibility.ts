import { useContext } from 'react';
import AccessContext from 'contexts/AccessContext';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';

/**
 * Per-user splash key used to remember that the checklist has been
 * dismissed. Persisted server-side via `setSplashSeen` so the "don't
 * open by default" preference survives logout; the header menu still
 * lets the user manually reopen.
 */
export const ONBOARDING_CHECKLIST_SPLASH_ID = 'onboarding-checklist';

/**
 * Whether the current user should see the floating onboarding checklist.
 *
 * Signal today: **current user is admin AND has `id === 1`** — the initial
 * admin auto-created by `initAdminUser` on a fresh install. Both signals
 * are already loaded on app boot (permissions + auth user), so this hook
 * makes no additional network calls.
 *
 * Known limitation: if the id-1 admin was ever deleted, no one else will
 * ever have id 1 and the checklist won't show on that instance. Acceptable
 * because mature instances that lost user 1 are past onboarding anyway.
 *
 * When we outgrow this heuristic (e.g. gate on instance age, an
 * `isNewInstance` flag from `ui-config`, or `first_seen_at` from the auth
 * user), swap the implementation of THIS hook — no call sites need to
 * change.
 */
export const useOnboardingChecklistEligibility = (): boolean => {
    const { isAdmin } = useContext(AccessContext);
    const { user, loading } = useAuthUser();
    if (loading || user === undefined) return false;
    return isAdmin && user.id === 1;
};
