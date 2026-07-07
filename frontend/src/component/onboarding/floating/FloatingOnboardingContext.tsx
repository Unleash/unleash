import {
    createContext,
    useContext,
    useMemo,
    type FC,
    type ReactNode,
} from 'react';
import { styled } from '@mui/material';
import useProjectOverview from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { useFeatureSearch } from 'hooks/api/getters/useFeatureSearch/useFeatureSearch';
import { getProjectOnboardingStep } from 'utils/getProjectOnboardingStep.ts';
import {
    type FloatingOnboardingCompleted,
    type FloatingOnboardingState,
    useFloatingOnboardingState,
} from './floatingOnboardingState.ts';

export const TOTAL_STEPS = 4;

interface FloatingOnboardingContextValue {
    state: FloatingOnboardingState;
    update: (patch: Partial<FloatingOnboardingState>) => void;
    markCompleted: (step: keyof FloatingOnboardingCompleted) => void;
    reset: () => void;
    /** Bring the helper back into view (used from the header menu). */
    open: () => void;
    projectId?: string;
    done: { project: boolean; flag: boolean; sdk: boolean; on: boolean };
    completedCount: number;
    totalSteps: number;
    environments: string[];
    goToFlagHref: string;
    /** First flag in the project — pre-fills the Connect SDK dialog. */
    feature?: string;
    refetchOverview: () => void;
}

const FloatingOnboardingContext =
    createContext<FloatingOnboardingContextValue | null>(null);

export const FloatingOnboardingProvider: FC<{ children: ReactNode }> = ({
    children,
}) => {
    const { state, update, markCompleted, reset } =
        useFloatingOnboardingState();
    const { projectId } = state;

    const {
        project,
        loading,
        refetch: refetchOverview,
    } = useProjectOverview(projectId ?? '');

    const { features } = useFeatureSearch(
        projectId
            ? { project: `IS:${projectId}` }
            : { project: 'IS:__floating_onboarding_none__' },
    );
    const firstFeature = features[0]?.name;
    const goToFlagHref = firstFeature
        ? `/projects/${projectId}/features/${firstFeature}`
        : `/projects/${projectId ?? ''}`;

    const environments = useMemo(
        () => (project.environments ?? []).map((env) => env.environment),
        [project.environments],
    );

    const serverStep =
        projectId && !loading
            ? getProjectOnboardingStep(project.onboardingStatus).current
            : 0;

    const done = {
        project: Boolean(state.completed.project || projectId),
        flag: Boolean(state.completed.flag || serverStep >= 1),
        sdk: Boolean(state.completed.sdk || serverStep >= 2),
        on: Boolean(state.completed.on || serverStep >= 3),
    };
    const completedCount = Object.values(done).filter(Boolean).length;

    const value: FloatingOnboardingContextValue = {
        state,
        update,
        markCompleted,
        reset,
        open: () => update({ dismissed: false, minimized: false }),
        projectId,
        done,
        completedCount,
        totalSteps: TOTAL_STEPS,
        environments,
        goToFlagHref,
        feature: firstFeature,
        refetchOverview,
    };

    return (
        <FloatingOnboardingContext.Provider value={value}>
            {children}
        </FloatingOnboardingContext.Provider>
    );
};

export const useFloatingOnboarding = () => {
    const context = useContext(FloatingOnboardingContext);
    if (!context) {
        throw new Error(
            'useFloatingOnboarding must be used within a FloatingOnboardingProvider',
        );
    }
    return context;
};

/**
 * Returns the context or null when rendered outside the provider (e.g. the
 * help menu on pages without MainLayout, or in isolated tests/stories).
 */
export const useOptionalFloatingOnboarding = () =>
    useContext(FloatingOnboardingContext);

const StyledBadge = styled('span')(({ theme }) => ({
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: 1,
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.elevation1,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0.25, 0.75),
    whiteSpace: 'nowrap',
}));

/** Small "X/Y" progress badge shared by the header menu and minimized helper. */
export const OnboardingProgressBadge = ({
    className,
}: {
    className?: string;
}) => {
    const { completedCount, totalSteps } = useFloatingOnboarding();
    return (
        <StyledBadge className={className}>
            {completedCount}/{totalSteps}
        </StyledBadge>
    );
};
