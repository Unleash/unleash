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
import { useUiFlag } from 'hooks/useUiFlag';
import {
    type FloatingOnboardingChecklistCompleted,
    type FloatingOnboardingChecklistState,
    useFloatingOnboardingChecklistState,
} from './floatingOnboardingChecklistState.ts';

interface FloatingOnboardingChecklistContextValue {
    state: FloatingOnboardingChecklistState;
    update: (patch: Partial<FloatingOnboardingChecklistState>) => void;
    markCompleted: (step: keyof FloatingOnboardingChecklistCompleted) => void;
    /** Bring the helper back into view (used from the header menu). */
    open: () => void;
    projectId?: string;
    quickTourEnabled: boolean;
    done: { tour: boolean; flag: boolean; sdk: boolean; on: boolean };
    completedCount: number;
    totalSteps: number;
    environments: string[];
    goToFlagHref: string;
    /** First flag in the project — pre-fills the Connect SDK dialog. */
    feature?: string;
    refetchOverview: () => void;
}

const FloatingOnboardingChecklistContext =
    createContext<FloatingOnboardingChecklistContextValue | null>(null);

export const FloatingOnboardingChecklistProvider: FC<{
    children: ReactNode;
}> = ({ children }) => {
    const { state, update, markCompleted } =
        useFloatingOnboardingChecklistState();
    const { projectId } = state;
    const quickTourEnabled = useUiFlag('quickTourDemo');

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
        tour: Boolean(state.completed.tour),
        flag: Boolean(state.completed.flag || serverStep >= 1),
        sdk: Boolean(state.completed.sdk || serverStep >= 2),
        on: Boolean(state.completed.on || serverStep >= 3),
    };
    const totalSteps = quickTourEnabled ? 4 : 3;
    const trackedDone = quickTourEnabled
        ? [done.tour, done.flag, done.sdk, done.on]
        : [done.flag, done.sdk, done.on];
    const completedCount = trackedDone.filter(Boolean).length;

    const value: FloatingOnboardingChecklistContextValue = {
        state,
        update,
        markCompleted,
        open: () => update({ dismissed: false, minimized: false }),
        projectId,
        quickTourEnabled,
        done,
        completedCount,
        totalSteps,
        environments,
        goToFlagHref,
        feature: firstFeature,
        refetchOverview,
    };

    return (
        <FloatingOnboardingChecklistContext.Provider value={value}>
            {children}
        </FloatingOnboardingChecklistContext.Provider>
    );
};

export const useFloatingOnboardingChecklist = () => {
    const context = useContext(FloatingOnboardingChecklistContext);
    if (!context) {
        throw new Error(
            'useFloatingOnboardingChecklist must be used within a FloatingOnboardingChecklistProvider',
        );
    }
    return context;
};

/**
 * Returns the context or null when rendered outside the provider (e.g. the
 * help menu on pages without MainLayout, or in isolated tests/stories).
 */
export const useOptionalFloatingOnboardingChecklist = () =>
    useContext(FloatingOnboardingChecklistContext);

const StyledBadge = styled('span')(({ theme }) => ({
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: 1,
    color: theme.palette.secondary.contrastText,
    backgroundColor: theme.palette.secondary.light,
    border: `1px solid ${theme.palette.secondary.border}`,
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(0.25, 0.75),
    whiteSpace: 'nowrap',
}));

/**
 * Small progress badge shared by the header menu and the checklist window.
 * Defaults to a compact "X/Y" for tight spots; pass `showLabel` for the
 * "X/Y Completed" form used inside the checklist header.
 */
export const OnboardingProgressBadge = ({
    className,
    showLabel = false,
}: {
    className?: string;
    showLabel?: boolean;
}) => {
    const { completedCount, totalSteps } = useFloatingOnboardingChecklist();
    return (
        <StyledBadge className={className}>
            {completedCount}/{totalSteps}
            {showLabel ? ' Completed' : null}
        </StyledBadge>
    );
};
