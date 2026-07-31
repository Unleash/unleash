import { useContext, useEffect, useState } from 'react';
import { IconButton, styled, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/Remove';
import { useNavigate } from 'react-router';
import { CreateFeatureDialog } from 'component/project/Project/PaginatedProjectFeatureToggles/ProjectFeatureTogglesHeader/CreateFeatureDialog.tsx';
import { ConnectSdkDialog } from 'component/onboarding/dialog/ConnectSdkDialog/ConnectSdkDialog.tsx';
import { useIntro } from 'component/onboarding/intro/IntroProvider.tsx';
import useSplashApi from 'hooks/api/actions/useSplashApi/useSplashApi.ts';
import { FloatingOnboardingChecklistContext } from './FloatingOnboardingChecklistContext.tsx';
import { OnboardingProgressBadge } from './OnboardingProgressBadge.tsx';
import { useFloatingOnboardingChecklist } from './useFloatingOnboardingChecklist.ts';
import { useFirstProjectFeature } from './useFirstProjectFeature.ts';
import { useChecklistRouteMatch } from './useChecklistRouteMatch.ts';
import { ChecklistSteps } from './ChecklistSteps.tsx';
import { isPendingActionExpired } from './floatingOnboardingChecklistState.ts';
import { ONBOARDING_CHECKLIST_SPLASH_ID } from './useOnboardingChecklistEligibility.ts';

const Window = styled('aside')(({ theme }) => ({
    position: 'fixed',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    width: 380,
    maxWidth: `calc(100vw - ${theme.spacing(4)})`,
    maxHeight: `calc(100vh - ${theme.spacing(6)})`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
    boxShadow: theme.boxShadows.popup,
    zIndex: 1100,
    [theme.breakpoints.down('sm')]: {
        left: theme.spacing(2),
        right: theme.spacing(2),
        width: 'auto',
    },
}));

const Header = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 1, 1, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    flexShrink: 0,
}));

const TitleRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    flexGrow: 1,
    minWidth: 0,
}));

const HeaderTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
}));

const Body = styled('div')({
    overflowY: 'auto',
});

/**
 * Wrapper: renders nothing when the user isn't eligible (context is null).
 * Keeps the inner component free of null checks.
 */
export const FloatingOnboardingChecklist = () => {
    const context = useContext(FloatingOnboardingChecklistContext);
    if (!context) return null;
    return <EligibleFloatingOnboardingChecklist />;
};

const EligibleFloatingOnboardingChecklist = () => {
    const {
        state,
        update,
        markCompleted,
        dismissed,
        projectId,
        visibleSteps,
        done,
        environments,
        refetchOverview,
    } = useFloatingOnboardingChecklist();
    const { feature, goToFlagHref } = useFirstProjectFeature(projectId);

    const { open: openIntro } = useIntro();
    const { setSplashSeen } = useSplashApi();
    const navigate = useNavigate();
    const { onProjectRoute, onSdkTargetRoute } = useChecklistRouteMatch({
        projectId,
        feature,
    });

    const [createFlagOpen, setCreateFlagOpen] = useState(false);
    const [connectSdkOpen, setConnectSdkOpen] = useState(false);

    // MainLayout re-mounts on cross-route navigation, which wipes local
    // dialog state. `pendingAction` lives in localStorage so a click on
    // "New feature flag" from any route survives the navigation and pops
    // the right dialog once we've landed on the target route.
    useEffect(() => {
        if (dismissed) return;
        const pending = state.pendingAction;
        if (!pending) return;
        if (isPendingActionExpired(pending, Date.now())) {
            update({ pendingAction: undefined });
            return;
        }
        const readyForPending =
            (pending.type === 'flag' && onProjectRoute) ||
            (pending.type === 'sdk' && onSdkTargetRoute);
        if (!readyForPending) return;
        if (pending.type === 'flag') setCreateFlagOpen(true);
        if (pending.type === 'sdk') setConnectSdkOpen(true);
        update({ pendingAction: undefined });
    }, [
        state.pendingAction,
        onProjectRoute,
        onSdkTargetRoute,
        dismissed,
        update,
    ]);

    if (dismissed) return null;

    const toggleMinimized = () => update({ minimized: !state.minimized });

    const handleDismiss = () => {
        // Also clear `pendingAction` so a dialog scheduled just before the
        // dismiss (or one that's been sitting in localStorage) doesn't pop
        // up right after the user closed the helper.
        update({ dismissed: true, pendingAction: undefined });
        // Persist server-side so dismissal survives a localStorage reset.
        setSplashSeen(ONBOARDING_CHECKLIST_SPLASH_ID);
    };

    const handleTakeTour = () =>
        openIntro({ onClose: () => markCompleted('tour') });

    const handleCreateFlag = () => {
        if (onProjectRoute) {
            setCreateFlagOpen(true);
        } else {
            update({
                pendingAction: { type: 'flag', setAt: Date.now() },
            });
            navigate(`/projects/${projectId}`);
        }
    };

    const handleConnectSdk = () => {
        if (onSdkTargetRoute) {
            setConnectSdkOpen(true);
        } else {
            update({
                pendingAction: { type: 'sdk', setAt: Date.now() },
            });
            navigate(
                feature
                    ? `/projects/${projectId}/features/${feature}`
                    : `/projects/${projectId}`,
            );
        }
    };

    return (
        <>
            <Window aria-label='Get started'>
                <Header>
                    <TitleRow onClick={toggleMinimized}>
                        <HeaderTitle>Get started</HeaderTitle>
                        <OnboardingProgressBadge showLabel />
                    </TitleRow>
                    <IconButton
                        size='small'
                        aria-label={state.minimized ? 'Expand' : 'Minimize'}
                        onClick={toggleMinimized}
                    >
                        <RemoveIcon fontSize='small' />
                    </IconButton>
                    <IconButton
                        size='small'
                        aria-label='Close'
                        onClick={handleDismiss}
                    >
                        <CloseIcon fontSize='small' />
                    </IconButton>
                </Header>

                {state.minimized ? null : (
                    <Body>
                        <ChecklistSteps
                            visibleSteps={visibleSteps}
                            done={done}
                            goToFlagHref={goToFlagHref}
                            onTakeTour={handleTakeTour}
                            onCreateFlag={handleCreateFlag}
                            onConnectSdk={handleConnectSdk}
                        />
                    </Body>
                )}
            </Window>

            <CreateFeatureDialog
                open={createFlagOpen}
                onClose={() => setCreateFlagOpen(false)}
                onSuccess={() => {
                    // `onSuccess` only fires on 2xx, so we know a flag
                    // exists — tick locally to bridge the lag before
                    // `onboardingStatus` catches up. Server remains the
                    // source of truth via the merge in the context hook.
                    markCompleted('flag');
                    refetchOverview();
                }}
            />
            <ConnectSdkDialog
                open={connectSdkOpen}
                onClose={() => {
                    setConnectSdkOpen(false);
                    // No local `markCompleted('sdk')`: closing this dialog
                    // isn't proof an SDK actually registered. The server
                    // reports `sdk-connected` when a real SDK checks in, so
                    // we just refetch and let that flip the step to done.
                    refetchOverview();
                }}
                projectId={projectId}
                environments={environments}
                feature={feature}
            />
        </>
    );
};
