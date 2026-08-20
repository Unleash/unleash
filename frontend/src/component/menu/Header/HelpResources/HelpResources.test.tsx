import { type FC, useEffect } from 'react';
import { expect, test, vi } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HelpResources } from './HelpResources';
import {
    HelpButtonHintProvider,
    type HelpButtonHintKind,
    useHelpButtonHint,
} from './HelpButtonHintContext.tsx';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { FloatingOnboardingChecklistContext } from 'component/onboarding/floatingChecklist/FloatingOnboardingChecklistContext.tsx';
import type { FloatingOnboardingChecklistContextValue } from 'component/onboarding/floatingChecklist/useChecklistContextValue.ts';
import {
    ONBOARDING_CHECKLIST_ELIGIBILITY_DECIDED_SPLASH_ID,
    ONBOARDING_CHECKLIST_ELIGIBLE_SPLASH_ID,
} from 'component/onboarding/floatingChecklist/useOnboardingChecklistVisibility.ts';
import { ADMIN } from 'component/providers/AccessProvider/permissions.ts';

const HINT_TEXT = 'You can reopen the Get started checklist from here anytime';
const INTRO_HINT_TEXT = 'You can restart the Unleash Intro from here anytime';

const baseChecklistContext = (
    overrides: Partial<FloatingOnboardingChecklistContextValue> = {},
): FloatingOnboardingChecklistContextValue => ({
    state: { minimized: false, dismissed: false, completed: {} },
    update: vi.fn(),
    markCompleted: vi.fn(),
    open: vi.fn(),
    openRequestCounter: 0,
    dismissed: false,
    projectId: 'default',
    visibleSteps: ['flag', 'sdk', 'on'],
    done: { tour: false, flag: false, sdk: false, on: false },
    completedCount: 0,
    totalSteps: 3,
    environments: [],
    refetchOverview: vi.fn(),
    ...overrides,
});

const renderWithChecklistContext = (
    overrides: Partial<FloatingOnboardingChecklistContextValue> = {},
    options?: Parameters<typeof render>[1],
) =>
    render(
        <FloatingOnboardingChecklistContext.Provider
            value={baseChecklistContext(overrides)}
        >
            <HelpResources />
        </FloatingOnboardingChecklistContext.Provider>,
        options,
    );

const server = testServerSetup();

const openFeedback = vi.fn();
vi.mock('component/feedbackNew/useFeedback', async (importOriginal) => {
    const actual =
        await importOriginal<
            typeof import('component/feedbackNew/useFeedback')
        >();
    return { ...actual, useFeedback: () => ({ openFeedback }) };
});

const trackEvent = vi.fn();
vi.mock('hooks/useEventTracker', () => ({
    useEventTracker: () => ({ trackEvent }),
}));

const openIntroMock = vi.fn();
vi.mock('component/onboarding/intro/IntroProvider.tsx', () => ({
    useIntro: () => ({ open: openIntroMock }),
}));

const withLearningLab = () =>
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { learningLab: true },
    });

test('opens help menu with all items when clicking the button', async () => {
    withLearningLab();
    render(<HelpResources />);

    await userEvent.click(
        await screen.findByRole('button', { name: 'Help and resources' }),
    );

    expect(screen.getByText('Visit Learning Lab')).toBeInTheDocument();
    expect(
        screen.getByRole('menuitem', { name: 'Learning Lab' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Documentation')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('Give feedback')).toBeInTheDocument();
    expect(screen.getByText('Slack community')).toBeInTheDocument();
});

test('quick tour item is shown when the flag is on', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { onboardingIntroTour: true },
    });
    render(<HelpResources />);

    await userEvent.click(
        await screen.findByRole('button', { name: 'Help and resources' }),
    );

    expect(screen.getByText('Unleash Intro')).toBeInTheDocument();
});

test('quick tour item is hidden when the flag is off', async () => {
    withLearningLab();
    render(<HelpResources />);

    await userEvent.click(
        await screen.findByRole('button', { name: 'Help and resources' }),
    );

    expect(screen.queryByText('Unleash Intro')).not.toBeInTheDocument();
});

test('external links have correct hrefs', async () => {
    withLearningLab();
    render(<HelpResources />);

    await userEvent.click(
        await screen.findByRole('button', { name: 'Help and resources' }),
    );

    expect(screen.getByText('Visit Learning Lab').closest('a')).toHaveAttribute(
        'href',
        'https://learning.getunleash.io/',
    );
    expect(
        screen.getByRole('menuitem', { name: 'Learning Lab' }),
    ).toHaveAttribute('href', 'https://learning.getunleash.io/');
    expect(screen.getByText('Documentation').closest('a')).toHaveAttribute(
        'href',
        'https://docs.getunleash.io/',
    );
    expect(screen.getByText('GitHub').closest('a')).toHaveAttribute(
        'href',
        'https://github.com/Unleash/unleash',
    );
    expect(screen.getByText('Slack community').closest('a')).toHaveAttribute(
        'href',
        'https://slack.unleash.run/',
    );
});

test('give feedback calls openFeedback with the correct title and labels', async () => {
    withLearningLab();
    render(<HelpResources />);

    await userEvent.click(
        await screen.findByRole('button', { name: 'Help and resources' }),
    );

    await userEvent.click(screen.getByText('Give feedback'));

    expect(openFeedback).toHaveBeenCalledWith({
        title: 'How would you rate your overall experience with Unleash?',
        positiveLabel: "What's working well for you in Unleash?",
        areasForImprovementsLabel:
            'What could be improved to make Unleash work better for you? ',
    });
});

test("What's new item links to /whats-new", async () => {
    render(<HelpResources />);

    await userEvent.click(
        await screen.findByRole('button', { name: 'Help and resources' }),
    );

    expect(
        screen.getByRole('menuitem', { name: /What's new/ }),
    ).toHaveAttribute('href', '/whats-new');
});

test('tracks menu open and item click', async () => {
    withLearningLab();
    render(<HelpResources />);

    await userEvent.click(
        await screen.findByRole('button', { name: 'Help and resources' }),
    );

    expect(trackEvent).toHaveBeenCalledWith('help-resources', {
        props: { eventType: 'opened' },
    });

    await userEvent.click(screen.getByText('GitHub'));

    expect(trackEvent).toHaveBeenCalledWith('help-resources', {
        props: { eventType: 'click', option: 'github' },
    });
});

const mockCheapGatePassingWithSplash = (splash: Record<string, boolean>) => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { floatingOnboardingChecklist: true },
    });
    testServerRoute(server, '/api/admin/user', {
        user: { id: 1 },
        permissions: [],
        feedback: [],
        splash,
    });
};

test('hides Get started when the user is already known to be not eligible', async () => {
    mockCheapGatePassingWithSplash({
        [ONBOARDING_CHECKLIST_ELIGIBILITY_DECIDED_SPLASH_ID]: true,
    });

    renderWithChecklistContext({}, { permissions: [{ permission: ADMIN }] });

    await userEvent.click(
        await screen.findByRole('button', { name: 'Help and resources' }),
    );

    expect(
        screen.queryByRole('menuitem', { name: /Get started/ }),
    ).not.toBeInTheDocument();
});

test('shows Get started with progress badge when the user is already known to be eligible', async () => {
    mockCheapGatePassingWithSplash({
        [ONBOARDING_CHECKLIST_ELIGIBILITY_DECIDED_SPLASH_ID]: true,
        [ONBOARDING_CHECKLIST_ELIGIBLE_SPLASH_ID]: true,
    });

    renderWithChecklistContext(
        { completedCount: 1, totalSteps: 3 },
        { permissions: [{ permission: ADMIN }] },
    );

    await userEvent.click(
        await screen.findByRole('button', { name: 'Help and resources' }),
    );

    const item = await screen.findByRole('menuitem', { name: /Get started/ });
    expect(item).toBeInTheDocument();
    expect(item).toHaveTextContent('1/3');
});

test("hides Get started until the user's eligibility is known", async () => {
    mockCheapGatePassingWithSplash({});

    renderWithChecklistContext({}, { permissions: [{ permission: ADMIN }] });

    await userEvent.click(
        await screen.findByRole('button', { name: 'Help and resources' }),
    );

    expect(
        screen.queryByRole('menuitem', { name: /Get started/ }),
    ).not.toBeInTheDocument();
});

const HintSeeder: FC<{ kind: HelpButtonHintKind }> = ({ kind }) => {
    const { showHint } = useHelpButtonHint();
    useEffect(() => {
        showHint(kind);
    }, [kind, showHint]);
    return null;
};

const renderWithHint = (kind: HelpButtonHintKind) => {
    window.localStorage.clear();
    render(
        <HelpButtonHintProvider>
            <HintSeeder kind={kind} />
            <HelpResources />
        </HelpButtonHintProvider>,
    );
};

test('renders only the get-started copy while the get-started hint is active', async () => {
    withLearningLab();

    renderWithHint('get-started');

    expect(await screen.findByText(HINT_TEXT)).toBeInTheDocument();
    expect(screen.queryByText(INTRO_HINT_TEXT)).not.toBeInTheDocument();
});

test('renders only the intro-closed copy while the intro-closed hint is active', async () => {
    withLearningLab();

    renderWithHint('intro-closed');

    expect(await screen.findByText(INTRO_HINT_TEXT)).toBeInTheDocument();
    expect(screen.queryByText(HINT_TEXT)).not.toBeInTheDocument();
});

test('dismisses the help hint when the user opens the menu', async () => {
    withLearningLab();

    renderWithHint('get-started');
    expect(await screen.findByText(HINT_TEXT)).toBeInTheDocument();

    await userEvent.click(
        await screen.findByRole('button', { name: 'Help and resources' }),
    );

    await waitFor(() =>
        expect(screen.queryByText(HINT_TEXT)).not.toBeInTheDocument(),
    );
});

test('surfaces the intro-closed hint after the intro closes from the menu', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { onboardingIntroTour: true },
    });
    window.localStorage.clear();
    openIntroMock.mockImplementationOnce((options) => options?.onExited?.());

    render(
        <HelpButtonHintProvider>
            <HelpResources />
        </HelpButtonHintProvider>,
    );

    await userEvent.click(
        await screen.findByRole('button', { name: 'Help and resources' }),
    );
    await userEvent.click(screen.getByText('Unleash Intro'));

    expect(await screen.findByText(INTRO_HINT_TEXT)).toBeInTheDocument();
});
