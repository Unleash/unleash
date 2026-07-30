import { useContext, useEffect, useState } from 'react';
import { IconButton, styled, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/Remove';
import { useLocation, useNavigate } from 'react-router';
import { CreateFeatureDialog } from 'component/project/Project/PaginatedProjectFeatureToggles/ProjectFeatureTogglesHeader/CreateFeatureDialog.tsx';
import { ConnectSdkDialog } from 'component/onboarding/dialog/ConnectSdkDialog/ConnectSdkDialog.tsx';
import { useQuickTour } from 'component/onboarding/quickTourDemo/QuickTourProvider.tsx';
import { FloatingOnboardingChecklistContext } from './FloatingOnboardingChecklistContext.tsx';
import { OnboardingProgressBadge } from './OnboardingProgressBadge.tsx';
import { useFloatingOnboardingChecklist } from './useFloatingOnboardingChecklist.ts';
import { useFirstProjectFeature } from './useFirstProjectFeature.ts';
import { ChecklistSteps } from './ChecklistSteps.tsx';
import { isPendingActionExpired } from './floatingOnboardingChecklistState.ts';

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
    cursor: 'pointer',
}));

const HeaderTitle = styled(Typography)(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.fontWeightBold,
}));

const Body = styled('div')({
    overflowY: 'auto',
});

// Segment-aware prefix match: avoids `/projects/default` matching
// `/projects/default-team` (a real project slug) or `/features/foo` matching
// `/features/foobar`.
const isOnOrUnder = (pathname: string, prefix: string) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`);

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
        projectId,
        quickTourEnabled,
        done,
        environments,
        refetchOverview,
    } = useFloatingOnboardingChecklist();
    const { feature, goToFlagHref } = useFirstProjectFeature(projectId);

    const { open: openQuickTour } = useQuickTour();
    const navigate = useNavigate();
    const location = useLocation();

    const [createFlagOpen, setCreateFlagOpen] = useState(false);
    const [connectSdkOpen, setConnectSdkOpen] = useState(false);

    // MainLayout re-mounts on cross-route navigation, which wipes local
    // dialog state. `pendingAction` lives in localStorage so a click on
    // "New feature flag" from any route survives the navigation and pops
    // the right dialog once we've landed on the project route.
    const onProjectRoute = isOnOrUnder(
        location.pathname,
        `/projects/${projectId}`,
    );
    useEffect(() => {
        const pending = state.pendingAction;
        if (!pending) return;
        if (isPendingActionExpired(pending, Date.now())) {
            update({ pendingAction: undefined });
            return;
        }
        if (!onProjectRoute) return;
        if (pending.type === 'flag') setCreateFlagOpen(true);
        if (pending.type === 'sdk') setConnectSdkOpen(true);
        update({ pendingAction: undefined });
    }, [state.pendingAction, onProjectRoute, update]);

    if (state.dismissed) return null;

    const toggleMinimized = () => update({ minimized: !state.minimized });

    const handleTakeTour = () =>
        openQuickTour({ onClose: () => markCompleted('tour') });

    const handleCreateFlag = () => {
        if (onProjectRoute) {
            setCreateFlagOpen(true);
        } else {
            update({ pendingAction: { type: 'flag', setAt: Date.now() } });
            navigate(`/projects/${projectId}`);
        }
    };

    const handleConnectSdk = () => {
        const targetHref = feature
            ? `/projects/${projectId}/features/${feature}`
            : `/projects/${projectId}`;
        if (isOnOrUnder(location.pathname, targetHref)) {
            setConnectSdkOpen(true);
        } else {
            update({ pendingAction: { type: 'sdk', setAt: Date.now() } });
            navigate(targetHref);
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
                        onClick={() => update({ dismissed: true })}
                    >
                        <CloseIcon fontSize='small' />
                    </IconButton>
                </Header>

                {state.minimized ? null : (
                    <Body>
                        <ChecklistSteps
                            quickTourEnabled={quickTourEnabled}
                            done={done}
                            goToFlagHref={goToFlagHref}
                            onTakeTour={handleTakeTour}
                            onCreateFlag={handleCreateFlag}
                            onConnectSdk={handleConnectSdk}
                            onGoToFlag={() => markCompleted('on')}
                        />
                    </Body>
                )}
            </Window>

            <CreateFeatureDialog
                open={createFlagOpen}
                onClose={() => setCreateFlagOpen(false)}
                onSuccess={() => {
                    markCompleted('flag');
                    refetchOverview();
                }}
            />
            <ConnectSdkDialog
                open={connectSdkOpen}
                onClose={() => {
                    setConnectSdkOpen(false);
                    markCompleted('sdk');
                    refetchOverview();
                }}
                projectId={projectId}
                environments={environments}
                feature={feature}
            />
        </>
    );
};
