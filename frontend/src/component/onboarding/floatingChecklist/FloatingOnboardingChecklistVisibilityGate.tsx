import { type FC, useEffect } from 'react';
import { useAuthSplash } from 'hooks/api/getters/useAuth/useAuthSplash.ts';
import useProjects from 'hooks/api/getters/useProjects/useProjects.ts';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview.ts';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig.ts';
import useSplashApi from 'hooks/api/actions/useSplashApi/useSplashApi.ts';
import { FloatingOnboardingChecklist } from './FloatingOnboardingChecklist.tsx';
import { CHECKLIST_PROJECT_ID } from './useChecklistContextValue.ts';
import {
    ONBOARDING_CHECKLIST_ELIGIBILITY_DECIDED_SPLASH_ID,
    ONBOARDING_CHECKLIST_ELIGIBLE_SPLASH_ID,
    useOnboardingChecklistVisibility,
} from './useOnboardingChecklistVisibility.ts';

export const FloatingOnboardingChecklistVisibilityGate: FC = () => {
    const visibility = useOnboardingChecklistVisibility();
    if (visibility === 'hidden') return null;
    if (visibility === 'visible') return <FloatingOnboardingChecklist />;
    return <UndecidedVisibilityLatch />;
};

const UndecidedVisibilityLatch: FC = () => {
    const { isEnterprise, loading } = useUiConfig();
    if (loading) return null;
    return isEnterprise() ? (
        <EnterpriseUndecidedVisibilityLatch />
    ) : (
        <OssUndecidedVisibilityLatch />
    );
};

const OssUndecidedVisibilityLatch: FC = () => {
    const { project, loading, error } =
        useProjectOverview(CHECKLIST_PROJECT_ID);
    const notFound = error?.status === 404;
    const decided = !loading && (!error || notFound);
    const isEligible =
        decided &&
        !notFound &&
        project.onboardingStatus?.status !== 'onboarded';
    useLatchVisibilityDecision(decided, isEligible);
    return null;
};

const EnterpriseUndecidedVisibilityLatch: FC = () => {
    const { projects, loading, error } = useProjects();
    const decided = !loading && !error;
    const isEligible =
        decided &&
        projects.some((p) => p.id === CHECKLIST_PROJECT_ID) &&
        !projects.some((p) => p.onboardingStatus?.status === 'onboarded');
    useLatchVisibilityDecision(decided, isEligible);
    return null;
};

const useLatchVisibilityDecision = (decided: boolean, isEligible: boolean) => {
    const { setSplashSeen } = useSplashApi();
    const { refetchSplash } = useAuthSplash();

    // biome-ignore lint/correctness/useExhaustiveDependencies: unstable: setSplashSeen, refetchSplash
    useEffect(() => {
        if (!decided) return;
        const posts = [
            setSplashSeen(ONBOARDING_CHECKLIST_ELIGIBILITY_DECIDED_SPLASH_ID),
        ];
        if (isEligible) {
            posts.push(setSplashSeen(ONBOARDING_CHECKLIST_ELIGIBLE_SPLASH_ID));
        }
        Promise.all(posts)
            .then(refetchSplash)
            .catch(() => refetchSplash());
    }, [decided, isEligible]);
};
