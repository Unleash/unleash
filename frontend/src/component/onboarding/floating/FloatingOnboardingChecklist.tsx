import { type ReactNode, useContext, useEffect, useState } from 'react';
import { Button, IconButton, styled, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/Remove';
import { Link, useNavigate } from 'react-router';
import { CreateFeatureDialog } from 'component/project/Project/PaginatedProjectFeatureToggles/ProjectFeatureTogglesHeader/CreateFeatureDialog.tsx';
import { ConnectSdkDialog } from 'component/onboarding/dialog/ConnectSdkDialog/ConnectSdkDialog.tsx';
import { useIntro } from 'component/onboarding/intro/IntroProvider.tsx';
import useSplashApi from 'hooks/api/actions/useSplashApi/useSplashApi.ts';
import { FloatingOnboardingChecklistContext } from './FloatingOnboardingChecklistContext.tsx';
import { OnboardingProgressBadge } from './OnboardingProgressBadge.tsx';
import { useFloatingOnboardingChecklist } from './useFloatingOnboardingChecklist.ts';
import { useFirstProjectFeature } from './useFirstProjectFeature.ts';
import { useChecklistRouteMatch } from './useChecklistRouteMatch.ts';
import { ChecklistSteps, type ChecklistStep } from './ChecklistSteps.tsx';
import { isPendingActionExpired } from './floatingOnboardingChecklistState.ts';
import type { ChecklistStepKey } from './useChecklistContextValue.ts';
import {
    ONBOARDING_CHECKLIST_SPLASH_ID,
    ONBOARDING_TOUR_SPLASH_ID,
} from './useOnboardingChecklistEligibility.ts';

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

const Primary = ({
    onClick,
    disabled = false,
    children,
}: {
    onClick: () => void;
    disabled?: boolean;
    children: ReactNode;
}) => (
    <Button
        variant='contained'
        color='primary'
        size='small'
        onClick={onClick}
        disabled={disabled}
    >
        {children}
    </Button>
);

const Done = () => (
    <Button
        variant='outlined'
        color='inherit'
        size='small'
        disabled
        startIcon={<CheckIcon />}
    >
        Done
    </Button>
);

const GoToFlag = ({
    href,
    variant = 'outlined',
    disabled = false,
}: {
    href: string | null;
    variant?: 'outlined' | 'contained';
    disabled?: boolean;
}) =>
    href && !disabled ? (
        <Button
            variant={variant}
            color='primary'
            size='small'
            component={Link}
            to={href}
        >
            Go to flag
        </Button>
    ) : (
        <Button variant='contained' color='primary' size='small' disabled>
            Go to flag
        </Button>
    );

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

    // `pendingAction` is persisted so a "New feature flag" / "Connect SDK"
    // click survives the MainLayout re-mount on route change, then pops the
    // dialog once we've landed on the target route.
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
        // Clear `pendingAction` too so a queued dialog doesn't pop up right
        // after the user dismissed the helper. Splash persists dismissal
        // server-side, surviving a localStorage reset.
        update({ dismissed: true, pendingAction: undefined });
        setSplashSeen(ONBOARDING_CHECKLIST_SPLASH_ID);
    };

    const handleTakeTour = () =>
        openIntro({
            // `onClose` fires for any exit (Skip, Escape, backdrop, Finish, ×).
            onClose: () => {
                markCompleted('tour');
                setSplashSeen(ONBOARDING_TOUR_SPLASH_ID);
            },
        });

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
            navigate(goToFlagHref ?? `/projects/${projectId}`);
        }
    };

    const stepDefinitions: Record<
        ChecklistStepKey,
        Omit<ChecklistStep, 'key'>
    > = {
        tour: {
            title: 'Unleash Intro',
            body: 'Learn the key concepts of rolling out a flag in Unleash.',
            done: done.tour,
            action: done.tour ? (
                <Done />
            ) : (
                <Primary onClick={handleTakeTour}>Take the tour</Primary>
            ),
        },
        flag: {
            title: 'Create a feature flag',
            body: 'You must create a feature flag before you can connect an SDK.',
            done: done.flag,
            action: done.flag ? (
                <GoToFlag href={goToFlagHref} />
            ) : (
                <Primary onClick={handleCreateFlag}>New feature flag</Primary>
            ),
        },
        sdk: {
            title: done.sdk ? 'Connect SDK' : 'Connect SDKs',
            body: done.sdk
                ? 'You can connect as many SDKs as you need.'
                : 'To start using your feature flag, connect an SDK to the project.',
            done: done.sdk,
            action: done.sdk ? (
                <Done />
            ) : (
                <Primary onClick={handleConnectSdk} disabled={!done.flag}>
                    Connect SDK
                </Primary>
            ),
        },
        on: {
            title: 'Turn flag on',
            body: 'Check that the flag is working by turning it on.',
            done: done.on,
            action: done.on ? (
                <GoToFlag href={goToFlagHref} />
            ) : (
                <GoToFlag
                    href={goToFlagHref}
                    variant='contained'
                    disabled={!done.sdk}
                />
            ),
        },
    };
    const steps: ChecklistStep[] = visibleSteps.map((key) => ({
        key,
        ...stepDefinitions[key],
    }));

    return (
        <>
            <Window aria-label='Get started'>
                <Header>
                    <TitleRow>
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
                        <ChecklistSteps steps={steps} />
                    </Body>
                )}
            </Window>

            <CreateFeatureDialog
                open={createFlagOpen}
                onClose={() => setCreateFlagOpen(false)}
                onSuccess={() => {
                    // Bridge tick: `onboardingStatus` can lag the refetch.
                    markCompleted('flag');
                    refetchOverview();
                }}
            />
            <ConnectSdkDialog
                open={connectSdkOpen}
                onClose={() => {
                    // No local `markCompleted('sdk')` — closing the dialog
                    // isn't proof an SDK actually registered.
                    setConnectSdkOpen(false);
                    refetchOverview();
                }}
                projectId={projectId}
                environments={environments}
                feature={feature}
            />
        </>
    );
};
