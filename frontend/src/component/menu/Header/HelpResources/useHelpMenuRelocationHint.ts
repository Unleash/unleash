import { useContext, useEffect } from 'react';
import { useUiFlag } from 'hooks/useUiFlag';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';
import {
    getLocalStorageItem,
    getSessionStorageItem,
    setLocalStorageItem,
    setSessionStorageItem,
} from 'utils/storage.ts';
import { FloatingOnboardingChecklistContext } from 'component/onboarding/floatingChecklist/FloatingOnboardingChecklistContext.tsx';
import { useOnboardingChecklistVisibility } from 'component/onboarding/floatingChecklist/useOnboardingChecklistVisibility.ts';
import { useHelpButtonHint } from './HelpButtonHintContext.tsx';

const SESSION_EVALUATED_KEY = 'help-menu-relocation-hint:evaluated';
const NEW_USER_SKIP_KEY =
    'help-menu-relocation-hint:new-user-first-login-skipped';

const NEW_USER_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const RELOCATION_HINT_END = Date.UTC(2026, 10, 1);

export const relocationHintCampaignOver = () =>
    Date.now() >= RELOCATION_HINT_END;

export const useHelpMenuRelocationHint = () => {
    const enabled = useUiFlag('helpMenuRelocationHint');
    const { user } = useAuthUser();
    const checklistVisibility = useOnboardingChecklistVisibility();
    const checklist = useContext(FloatingOnboardingChecklistContext);
    const checklistClearsWay =
        checklistVisibility === 'hidden' || Boolean(checklist?.dismissed);

    const { activeHint, showHint, isHintSeen } = useHelpButtonHint();

    useEffect(() => {
        if (!enabled || !user) return;
        if (relocationHintCampaignOver()) return;
        if (isHintSeen('menu-regroup')) return;
        if (!checklistClearsWay) return;
        if (getSessionStorageItem<boolean>(SESSION_EVALUATED_KEY)) return;
        setSessionStorageItem(SESSION_EVALUATED_KEY, true);

        if (activeHint && activeHint !== 'menu-regroup') return;

        const accountAgeMs = user.createdAt
            ? Date.now() - new Date(user.createdAt).getTime()
            : Number.POSITIVE_INFINITY;
        const isNewUser =
            Number.isFinite(accountAgeMs) &&
            accountAgeMs >= 0 &&
            accountAgeMs < NEW_USER_MAX_AGE_MS;

        if (isNewUser && !getLocalStorageItem<boolean>(NEW_USER_SKIP_KEY)) {
            setLocalStorageItem(NEW_USER_SKIP_KEY, true);
            return;
        }

        showHint('menu-regroup');
    }, [enabled, user, checklistClearsWay, activeHint, showHint, isHintSeen]);
};
