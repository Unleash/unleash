import { type ReactNode, useContext, useEffect, useRef, useState } from 'react';
import {
    Button,
    IconButton,
    keyframes,
    styled,
    Typography,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import MinimizeIcon from '@mui/icons-material/Minimize';
import { Link } from 'react-router';
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
import { usePendingAction } from './usePendingAction.ts';
import type { ChecklistStepKey } from './useChecklistContextValue.ts';
import { ONBOARDING_CHECKLIST_SPLASH_ID } from './useOnboardingChecklistEligibility.ts';

const PULSE_DURATION_MS = 900;

const pulse = keyframes`
    0%   { outline-color: var(--pulse-color); outline-offset: 0px; }
    100% { outline-color: transparent;         outline-offset: 8px; }
`;

const Window = styled('aside', {
    shouldForwardProp: (prop) => prop !== 'pulsing',
})<{ pulsing?: boolean }>(({ theme, pulsing }) => ({
    position: 'fixed',
    bottom: theme.spacing(3),
    right: theme.spacing(3),
    width: 380,
    maxWidth: `calc(100vw - ${theme.spacing(4)})`,
    maxHeight: `calc(100vh - ${theme.spacing(6)})`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.default,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadiusLarge,
    boxShadow: theme.boxShadows.popup,
    zIndex: 1100,
    [theme.breakpoints.down('sm')]: {
        left: theme.spacing(2),
        right: theme.spacing(2),
        width: 'auto',
    },
    ...(pulsing && {
        '--pulse-color': theme.palette.primary.main,
        outline: '3px solid transparent',
        animation: `${pulse} ${PULSE_DURATION_MS}ms ease-out`,
    }),
}));

const Header = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1, 1.5, 1, 1.5),
    background: theme.palette.background.elevation1,
    flexShrink: 0,
}));

const TitleRow = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
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
        size='medium'
        onClick={onClick}
        disabled={disabled}
    >
        {children}
    </Button>
);

const Secondary = ({
    onClick,
    children,
}: {
    onClick: () => void;
    children: ReactNode;
}) => (
    <Button variant='outlined' color='primary' size='medium' onClick={onClick}>
        {children}
    </Button>
);

const Done = () => (
    <Button
        variant='outlined'
        color='inherit'
        size='medium'
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
    onFlagPage = false,
}: {
    href: string | null;
    variant?: 'outlined' | 'contained';
    disabled?: boolean;
    onFlagPage?: boolean;
}) => {
    if (onFlagPage) {
        return (
            <Button variant='outlined' color='inherit' size='medium' disabled>
                Viewing this flag
            </Button>
        );
    }
    return href && !disabled ? (
        <Button
            variant={variant}
            color='primary'
            size='medium'
            component={Link}
            to={href}
        >
            Go to flag
        </Button>
    ) : (
        <Button variant='contained' color='primary' size='medium' disabled>
            Go to flag
        </Button>
    );
};

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
        openRequestCounter,
        showHelpHint,
    } = useFloatingOnboardingChecklist();
    const { feature, goToFlagHref } = useFirstProjectFeature(projectId);

    const { open: openIntro } = useIntro();
    const { setSplashSeen } = useSplashApi();
    const { onProjectRoute, onSdkTargetRoute, onFlagPage } =
        useChecklistRouteMatch({
            projectId,
            feature,
        });

    const [createFlagOpen, setCreateFlagOpen] = useState(false);
    const [connectSdkOpen, setConnectSdkOpen] = useState(false);
    const [pulsing, setPulsing] = useState(false);
    const initialCounterRef = useRef(openRequestCounter);
    useEffect(() => {
        if (openRequestCounter === initialCounterRef.current) return;
        setPulsing(true);
        const timeout = window.setTimeout(
            () => setPulsing(false),
            PULSE_DURATION_MS,
        );
        return () => window.clearTimeout(timeout);
    }, [openRequestCounter]);

    // Persisted across the MainLayout re-mount that happens on route change.
    const { runOnPage, cancelPendingAction } = usePendingAction({
        actions: {
            flag: {
                atPage: onProjectRoute,
                page: `/projects/${projectId}`,
                action: () => setCreateFlagOpen(true),
            },
            sdk: {
                atPage: onSdkTargetRoute,
                page: goToFlagHref ?? `/projects/${projectId}`,
                action: () => setConnectSdkOpen(true),
            },
        },
    });

    if (dismissed) return null;

    const toggleMinimized = () => update({ minimized: !state.minimized });

    const handleDismiss = () => {
        cancelPendingAction();
        update({ dismissed: true });
        setSplashSeen(ONBOARDING_CHECKLIST_SPLASH_ID);
        showHelpHint();
    };

    const handleTakeTour = () =>
        openIntro({
            onFinish: () => markCompleted('tour'),
        });

    const handleCreateFlag = () => runOnPage('flag');
    const handleConnectSdk = () => runOnPage('sdk');

    const stepDefinitions: Record<
        ChecklistStepKey,
        Omit<ChecklistStep, 'key'>
    > = {
        tour: {
            title: 'Unleash Intro',
            body: 'Learn the key concepts of rolling out a flag in Unleash.',
            done: done.tour,
            action: done.tour ? (
                <Secondary onClick={handleTakeTour}>Take the tour</Secondary>
            ) : (
                <Primary onClick={handleTakeTour}>Take the tour</Primary>
            ),
        },
        flag: {
            title: 'Create a feature flag',
            body: 'You must create a feature flag before you can connect an SDK.',
            done: done.flag,
            action: done.flag ? (
                <GoToFlag href={goToFlagHref} onFlagPage={onFlagPage} />
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
                <GoToFlag href={goToFlagHref} onFlagPage={onFlagPage} />
            ) : (
                <GoToFlag
                    href={goToFlagHref}
                    variant='contained'
                    disabled={!done.sdk}
                    onFlagPage={onFlagPage}
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
            <Window aria-label='Get started' pulsing={pulsing}>
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
                        <MinimizeIcon fontSize='small' />
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
                    // No local tick — closing the dialog isn't proof an SDK
                    // actually registered.
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
