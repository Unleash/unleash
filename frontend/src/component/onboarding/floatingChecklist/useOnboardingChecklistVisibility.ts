import { useAuthSplash } from 'hooks/api/getters/useAuth/useAuthSplash.ts';
import { useOnboardingChecklistEligibility } from './useOnboardingChecklistEligibility.ts';

// `-decided` disambiguates "not yet decided" vs "decided not eligible".
export const ONBOARDING_CHECKLIST_ELIGIBILITY_DECIDED_SPLASH_ID =
    'onboarding-checklist-eligibility-decided';
export const ONBOARDING_CHECKLIST_ELIGIBLE_SPLASH_ID =
    'onboarding-checklist-eligible';

export type OnboardingChecklistVisibility = 'visible' | 'hidden' | 'undecided';

export const useOnboardingChecklistVisibility =
    (): OnboardingChecklistVisibility => {
        const eligible = useOnboardingChecklistEligibility();
        const { splash, loading } = useAuthSplash();

        if (!eligible) return 'hidden';
        if (loading) return 'undecided';

        const decided = Boolean(
            splash?.[ONBOARDING_CHECKLIST_ELIGIBILITY_DECIDED_SPLASH_ID],
        );
        if (!decided) return 'undecided';

        return splash?.[ONBOARDING_CHECKLIST_ELIGIBLE_SPLASH_ID]
            ? 'visible'
            : 'hidden';
    };
