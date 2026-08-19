import { beforeEach, expect, test, vi } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { testServerSetup } from 'utils/testServer';
import { FloatingOnboardingChecklist } from './FloatingOnboardingChecklist.tsx';
import { FloatingOnboardingChecklistContext } from './FloatingOnboardingChecklistContext.tsx';
import type { FloatingOnboardingChecklistContextValue } from './useChecklistContextValue.ts';
import {
    HelpButtonHintProvider,
    useHelpButtonHint,
} from 'component/menu/Header/HelpResources/HelpButtonHintContext.tsx';

testServerSetup();

const trackEvent = vi.fn();
vi.mock('hooks/useEventTracker', () => ({
    useEventTracker: () => ({ trackEvent }),
}));

vi.mock('component/onboarding/intro/IntroProvider.tsx', () => ({
    useIntro: () => ({ open: vi.fn() }),
    ONBOARDING_INTRO_FINISHED_SPLASH_ID: 'intro-finished',
}));

vi.mock('hooks/api/actions/useSplashApi/useSplashApi.ts', () => ({
    default: () => ({ setSplashSeen: vi.fn() }),
}));

vi.mock('./useFirstProjectFeature.ts', () => ({
    useFirstProjectFeature: () => ({
        feature: 'first-flag',
        goToFlagHref: '/projects/default/features/first-flag',
    }),
}));

vi.mock('./useChecklistRouteMatch.ts', () => ({
    useChecklistRouteMatch: () => ({
        onProjectRoute: true,
        onSdkTargetRoute: true,
        onFlagPage: false,
    }),
}));

vi.mock('./usePendingAction.ts', () => ({
    usePendingAction: () => ({
        runOnPage: vi.fn(),
        cancelPendingAction: vi.fn(),
    }),
}));

vi.mock(
    'component/project/Project/PaginatedProjectFeatureToggles/ProjectFeatureTogglesHeader/CreateFeatureDialog.tsx',
    () => ({ CreateFeatureDialog: () => null }),
);

vi.mock(
    'component/onboarding/dialog/ConnectSdkDialog/ConnectSdkDialog.tsx',
    () => ({
        ConnectSdkDialog: () => null,
    }),
);

const baseContext = (
    overrides: Partial<FloatingOnboardingChecklistContextValue> = {},
): FloatingOnboardingChecklistContextValue => ({
    state: { minimized: false, dismissed: false, completed: {} },
    update: vi.fn(),
    markCompleted: vi.fn(),
    open: vi.fn(),
    openRequestCounter: 0,
    dismissed: false,
    projectId: 'default',
    visibleSteps: ['tour', 'flag', 'sdk', 'on'],
    done: { tour: false, flag: false, sdk: false, on: false },
    completedCount: 0,
    totalSteps: 4,
    environments: [],
    refetchOverview: vi.fn(),
    ...overrides,
});

const renderWithContext = (
    overrides: Partial<FloatingOnboardingChecklistContextValue> = {},
) =>
    render(
        <FloatingOnboardingChecklistContext.Provider
            value={baseContext(overrides)}
        >
            <FloatingOnboardingChecklist />
        </FloatingOnboardingChecklistContext.Provider>,
    );

beforeEach(() => {
    trackEvent.mockClear();
    window.sessionStorage.clear();
    window.localStorage.clear();
});

const HintProbe = () => {
    const { activeHint } = useHelpButtonHint();
    return <span data-testid='active-hint'>{activeHint ?? 'none'}</span>;
};

test("tracks 'shown' once per session", async () => {
    const { unmount } = renderWithContext();

    expect(await screen.findByLabelText('Get started')).toBeInTheDocument();

    expect(trackEvent).toHaveBeenCalledWith('onboarding-checklist', {
        props: { eventType: 'shown' },
    });

    trackEvent.mockClear();
    unmount();

    // Route change re-mounts MainLayout, so the checklist mounts again.
    renderWithContext();
    await screen.findByLabelText('Get started');

    expect(trackEvent).not.toHaveBeenCalledWith(
        'onboarding-checklist',
        expect.objectContaining({
            props: expect.objectContaining({ eventType: 'shown' }),
        }),
    );
});

test("tracks 'close' click when the user closes it", async () => {
    renderWithContext();

    await userEvent.click(await screen.findByLabelText('Close'));

    expect(trackEvent).toHaveBeenCalledWith('onboarding-checklist', {
        props: { eventType: 'click', action: 'close' },
    });
});

test('surfaces the get-started help-button hint after the user dismisses the checklist', async () => {
    render(
        <HelpButtonHintProvider>
            <FloatingOnboardingChecklistContext.Provider value={baseContext()}>
                <FloatingOnboardingChecklist />
                <HintProbe />
            </FloatingOnboardingChecklistContext.Provider>
        </HelpButtonHintProvider>,
    );

    expect(screen.getByTestId('active-hint')).toHaveTextContent('none');

    await userEvent.click(await screen.findByLabelText('Close'));

    expect(screen.getByTestId('active-hint')).toHaveTextContent('get-started');
});

test("tracks 'minimize' click when the user minimizes the panel", async () => {
    renderWithContext();

    await userEvent.click(await screen.findByLabelText('Minimize'));

    expect(trackEvent).toHaveBeenCalledWith('onboarding-checklist', {
        props: { eventType: 'click', action: 'minimize' },
    });
});

test("tracks 'expand' click when the user expands the minimized panel", async () => {
    renderWithContext({
        state: { minimized: true, dismissed: false, completed: {} },
    });

    await userEvent.click(await screen.findByLabelText('Expand'));

    expect(trackEvent).toHaveBeenCalledWith('onboarding-checklist', {
        props: { eventType: 'click', action: 'expand' },
    });
});

test("tracks 'take-tour' click when the tour hasn't been completed yet", async () => {
    renderWithContext();

    // Tour is first incomplete → its body is auto-expanded.
    await userEvent.click(
        await screen.findByRole('button', { name: 'Take the tour' }),
    );

    expect(trackEvent).toHaveBeenCalledWith('onboarding-checklist', {
        props: { eventType: 'click', action: 'take-tour' },
    });
});

test("tracks 'retake-tour' click when the tour has already been completed", async () => {
    renderWithContext({
        done: { tour: true, flag: false, sdk: false, on: false },
    });

    // Tour is done, so the flag step is auto-expanded; expand the tour step.
    await userEvent.click(await screen.findByText('Unleash Intro'));
    await userEvent.click(
        await screen.findByRole('button', { name: 'Take the tour' }),
    );

    expect(trackEvent).toHaveBeenCalledWith('onboarding-checklist', {
        props: { eventType: 'click', action: 'retake-tour' },
    });
});

test("tracks 'create-flag' click on the flag step's action button", async () => {
    renderWithContext({
        visibleSteps: ['flag', 'sdk', 'on'],
        done: { tour: false, flag: false, sdk: false, on: false },
    });

    await userEvent.click(await screen.findByText('New feature flag'));

    expect(trackEvent).toHaveBeenCalledWith('onboarding-checklist', {
        props: { eventType: 'click', action: 'create-flag' },
    });
});

test("tracks 'view-created-flag' when the flag-step link is used after the flag exists", async () => {
    renderWithContext({
        visibleSteps: ['flag', 'sdk', 'on'],
        done: { tour: false, flag: true, sdk: false, on: false },
    });

    // Flag is done → 'sdk' is first-incomplete and auto-expanded;
    // expand the flag step to reveal its 'Go to flag' link.
    await userEvent.click(await screen.findByText('Create a feature flag'));
    await userEvent.click(
        await screen.findByRole('link', { name: 'Go to flag' }),
    );

    expect(trackEvent).toHaveBeenCalledWith('onboarding-checklist', {
        props: { eventType: 'click', action: 'view-created-flag' },
    });
});

test("tracks 'connect-sdk' click on the sdk step's action button", async () => {
    renderWithContext({
        visibleSteps: ['flag', 'sdk', 'on'],
        done: { tour: false, flag: true, sdk: false, on: false },
    });

    // 'sdk' is the first incomplete visible step → auto-expanded.
    await userEvent.click(
        await screen.findByRole('button', { name: 'Connect SDK' }),
    );

    expect(trackEvent).toHaveBeenCalledWith('onboarding-checklist', {
        props: { eventType: 'click', action: 'connect-sdk' },
    });
});

test("tracks 'enable-flag' click when the on-step's 'Go to flag' link is used", async () => {
    renderWithContext({
        visibleSteps: ['flag', 'sdk', 'on'],
        done: { tour: false, flag: true, sdk: true, on: false },
    });

    // 'on' is the first incomplete visible step, so its body ("Go to flag")
    // is auto-expanded and clickable.
    await userEvent.click(
        await screen.findByRole('link', { name: 'Go to flag' }),
    );

    expect(trackEvent).toHaveBeenCalledWith('onboarding-checklist', {
        props: { eventType: 'click', action: 'enable-flag' },
    });
});

test("tracks 'view-enabled-flag' when the on-step link is used after enabling", async () => {
    renderWithContext({
        visibleSteps: ['flag', 'sdk', 'on'],
        done: { tour: false, flag: true, sdk: true, on: true },
    });

    // With all visible steps done, expand the on-step explicitly.
    await userEvent.click(await screen.findByText('Turn flag on'));
    await userEvent.click(
        await screen.findByRole('link', { name: 'Go to flag' }),
    );

    expect(trackEvent).toHaveBeenCalledWith('onboarding-checklist', {
        props: { eventType: 'click', action: 'view-enabled-flag' },
    });
});
