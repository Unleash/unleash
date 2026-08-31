import {
    type ReactNode,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
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
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import Draggable from 'react-draggable';
import { Link } from 'react-router';
import { CreateFeatureDialog } from 'component/project/Project/PaginatedProjectFeatureToggles/ProjectFeatureTogglesHeader/CreateFeatureDialog.tsx';
import { ConnectSdkDialog } from 'component/onboarding/dialog/ConnectSdkDialog/ConnectSdkDialog.tsx';
import { useIntro } from 'component/onboarding/intro/IntroProvider.tsx';
import useSplashApi from 'hooks/api/actions/useSplashApi/useSplashApi.ts';
import { useEventTracker } from 'hooks/useEventTracker.ts';
import { getSessionStorageItem, setSessionStorageItem } from 'utils/storage.ts';
import { FloatingOnboardingChecklistContext } from './FloatingOnboardingChecklistContext.tsx';
import { OnboardingProgressBadge } from './OnboardingProgressBadge.tsx';
import { useFloatingOnboardingChecklist } from './useFloatingOnboardingChecklist.ts';
import { useFirstProjectFeature } from './useFirstProjectFeature.ts';
import { useChecklistRouteMatch } from './useChecklistRouteMatch.ts';
import { ChecklistSteps, type ChecklistStep } from './ChecklistSteps.tsx';
import { usePendingAction } from './usePendingAction.ts';
import { useDraggableWindow } from './useDraggableWindow.ts';
import { useChecklistDragPosition } from './useChecklistDragPosition.ts';
import type { ChecklistStepKey } from './useChecklistContextValue.ts';
import { ONBOARDING_CHECKLIST_SPLASH_ID } from './useOnboardingChecklistEligibility.ts';
import { useHelpButtonHint } from 'component/menu/Header/HelpResources/HelpButtonHintContext.tsx';

const CHECKLIST_SHOWN_TRACKED_KEY = 'floating-onboarding:shown-tracked:v1';

const DRAG_HANDLE_CLASS = 'drag-handle';
const DRAG_HANDLE_ICON_CLASS = 'drag-handle-icon';
const DRAG_CANCEL_SELECTOR = 'button';

type ChecklistClickAction =
    | 'close'
    | 'minimize'
    | 'expand'
    | 'take-tour'
    | 'retake-tour'
    | 'create-flag'
    | 'view-created-flag'
    | 'connect-sdk'
    | 'enable-flag'
    | 'view-enabled-flag';

type ChecklistEvent =
    | { eventType: 'shown' }
    | { eventType: 'click'; action: ChecklistClickAction };

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
    right: theme.spacing(20),
    width: 320,
    maxWidth: `calc(100vw - ${theme.spacing(4)})`,
    maxHeight: `calc(100vh - ${theme.spacing(6)})`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    WebkitMaskImage: '-webkit-radial-gradient(white, black)',
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

const Header = styled('div', {
    shouldForwardProp: (prop) => prop !== 'dragging' && prop !== 'isDraggable',
})<{ dragging?: boolean; isDraggable?: boolean }>(
    ({ theme, dragging, isDraggable }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(0.125),
        padding: theme.spacing(1, 1.5, 1, 0.75),
        background: theme.palette.background.elevation1,
        flexShrink: 0,
        ...(isDraggable && {
            cursor: dragging ? 'grabbing' : 'grab',
            // Prevent touch scroll and text selection from interfering with the drag.
            touchAction: 'none',
            userSelect: dragging ? 'none' : undefined,
            [`&:hover .${DRAG_HANDLE_ICON_CLASS}`]: {
                color: theme.palette.text.secondary,
            },
        }),
    }),
);

const DragHandle = styled(DragIndicatorIcon)(({ theme }) => ({
    color: theme.palette.text.disabled,
    fontSize: '1.25rem',
    flexShrink: 0,
    transition: theme.transitions.create('color'),
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
    onClick,
}: {
    href: string | null;
    variant?: 'outlined' | 'contained';
    disabled?: boolean;
    onFlagPage?: boolean;
    onClick?: () => void;
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
            onClick={onClick}
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
    } = useFloatingOnboardingChecklist();
    const { showHint: showHelpButtonHint } = useHelpButtonHint();
    const { feature, goToFlagHref } = useFirstProjectFeature(projectId);

    const { open: openIntro } = useIntro();
    const { setSplashSeen } = useSplashApi();
    const { onProjectRoute, onSdkTargetRoute, onFlagPage } =
        useChecklistRouteMatch({
            projectId,
            feature,
        });

    const { trackEvent } = useEventTracker();
    const trackChecklistEvent = useCallback(
        (event: ChecklistEvent) => {
            trackEvent('onboarding-checklist', { props: event });
        },
        [trackEvent],
    );

    const [dragPosition, setDragPosition] = useChecklistDragPosition();
    const {
        nodeRef,
        position,
        dragging,
        bounds,
        canDrag,
        onStart,
        onStop,
        onDrag,
    } = useDraggableWindow({
        position: dragPosition,
        onPositionChange: setDragPosition,
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

    useEffect(() => {
        if (dismissed) return;
        // The checklist mounts on every page, so gate the 'shown' event on
        // sessionStorage — one impression per session, not per navigation.
        if (getSessionStorageItem<boolean>(CHECKLIST_SHOWN_TRACKED_KEY)) return;
        setSessionStorageItem(CHECKLIST_SHOWN_TRACKED_KEY, true);
        trackChecklistEvent({ eventType: 'shown' });
    }, [dismissed, trackChecklistEvent]);

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

    const toggleMinimized = () => {
        const willBeMinimized = !state.minimized;
        trackChecklistEvent({
            eventType: 'click',
            action: willBeMinimized ? 'minimize' : 'expand',
        });
        update({ minimized: willBeMinimized });
    };

    const handleDismiss = () => {
        trackChecklistEvent({ eventType: 'click', action: 'close' });
        cancelPendingAction();
        update({ dismissed: true });
        setSplashSeen(ONBOARDING_CHECKLIST_SPLASH_ID);
        showHelpButtonHint('get-started');
    };

    const handleTakeTour = () => {
        trackChecklistEvent({
            eventType: 'click',
            action: done.tour ? 'retake-tour' : 'take-tour',
        });
        openIntro({
            onFinish: () => markCompleted('tour'),
        });
    };

    const handleCreateFlag = () => {
        trackChecklistEvent({ eventType: 'click', action: 'create-flag' });
        runOnPage('flag');
    };
    const handleConnectSdk = () => {
        trackChecklistEvent({ eventType: 'click', action: 'connect-sdk' });
        runOnPage('sdk');
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
                <GoToFlag
                    href={goToFlagHref}
                    onFlagPage={onFlagPage}
                    onClick={() =>
                        trackChecklistEvent({
                            eventType: 'click',
                            action: 'view-created-flag',
                        })
                    }
                />
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
                <GoToFlag
                    href={goToFlagHref}
                    onFlagPage={onFlagPage}
                    onClick={() =>
                        trackChecklistEvent({
                            eventType: 'click',
                            action: 'view-enabled-flag',
                        })
                    }
                />
            ) : (
                <GoToFlag
                    href={goToFlagHref}
                    variant='contained'
                    disabled={!done.sdk}
                    onFlagPage={onFlagPage}
                    onClick={() =>
                        trackChecklistEvent({
                            eventType: 'click',
                            action: 'enable-flag',
                        })
                    }
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
            <Draggable
                nodeRef={nodeRef}
                disabled={!canDrag}
                handle={`.${DRAG_HANDLE_CLASS}`}
                cancel={DRAG_CANCEL_SELECTOR}
                position={position}
                bounds={bounds}
                onStart={onStart}
                onStop={onStop}
                onDrag={onDrag}
            >
                <Window
                    aria-label='Get started'
                    pulsing={pulsing}
                    ref={nodeRef}
                >
                    <Header
                        isDraggable={canDrag}
                        dragging={dragging}
                        className={canDrag ? DRAG_HANDLE_CLASS : undefined}
                    >
                        {canDrag ? (
                            <DragHandle className={DRAG_HANDLE_ICON_CLASS} />
                        ) : null}
                        <TitleRow>
                            <HeaderTitle>Get started</HeaderTitle>
                            <OnboardingProgressBadge showLabel />
                        </TitleRow>
                        <IconButton
                            size='medium'
                            aria-label={state.minimized ? 'Expand' : 'Minimize'}
                            onClick={toggleMinimized}
                        >
                            <MinimizeIcon fontSize='medium' />
                        </IconButton>
                        <IconButton
                            size='medium'
                            aria-label='Close'
                            onClick={handleDismiss}
                        >
                            <CloseIcon fontSize='medium' />
                        </IconButton>
                    </Header>

                    {state.minimized ? null : (
                        <Body>
                            <ChecklistSteps steps={steps} />
                        </Body>
                    )}
                </Window>
            </Draggable>

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
