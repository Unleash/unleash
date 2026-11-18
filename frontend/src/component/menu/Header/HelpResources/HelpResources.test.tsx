import { type FC, useContext, useEffect } from 'react';
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
import {
    FloatingOnboardingChecklistContext,
    FloatingOnboardingChecklistProvider,
} from 'component/onboarding/floatingChecklist/FloatingOnboardingChecklistContext.tsx';
import type { FloatingOnboardingChecklistContextValue } from 'component/onboarding/floatingChecklist/useChecklistContextValue.ts';
import { ONBOARDING_CHECKLIST_ELIGIBILITY_DECIDED_SPLASH_ID } from 'component/onboarding/floatingChecklist/useOnboardingChecklistVisibility.ts';
import {
    CHECKLIST_ELIGIBLE_SPLASH,
    mockChecklistProjectOnboardingStarted,
    mockUserWithSplash,
} from 'component/onboarding/floatingChecklist/onboardingChecklistTestServer.ts';
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
    visibleSteps: ['tour', 'flag', 'sdk', 'on'],
    done: { tour: false, flag: false, sdk: false, on: false },
    completedCount: 0,
    totalSteps: 4,
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

const openIntroMock = vi.fn();
vi.mock('component/onboarding/intro/IntroProvider.tsx', () => ({
    useIntro: () => ({ open: openIntroMock }),
    ONBOARDING_INTRO_FINISHED_SPLASH_ID: 'intro-finished',
}));

vi.mock('../SearchDocs/SearchDocs.tsx', () => ({
    SearchDocsChat: ({
        open,
        onOpenChange,
    }: {
        open: boolean;
        onOpenChange: (open: boolean) => void;
    }) =>
        open ? (
            <div>
                Docs chat
                <button type='button' onClick={() => onOpenChange(false)}>
                    Close docs chat
                </button>
            </div>
        ) : null,
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

test('hides Get started when the user is already known to be not eligible', async () => {
    mockUserWithSplash(server, {
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
    mockUserWithSplash(server, CHECKLIST_ELIGIBLE_SPLASH);

    renderWithChecklistContext(
        { completedCount: 1, totalSteps: 4 },
        { permissions: [{ permission: ADMIN }] },
    );

    await userEvent.click(
        await screen.findByRole('button', { name: 'Help and resources' }),
    );

    const item = await screen.findByRole('menuitem', { name: /Get started/ });
    expect(item).toBeInTheDocument();
    expect(item).toHaveTextContent('1/4');
});

test('opens the closed dashboard V2 checklist from Help', async () => {
    window.localStorage.clear();
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { dashboardV2: true },
    });
    mockUserWithSplash(server, CHECKLIST_ELIGIBLE_SPLASH);
    mockChecklistProjectOnboardingStarted(server);
    const ChecklistStatus = () => {
        const checklist = useContext(FloatingOnboardingChecklistContext);
        return (
            <span>
                {checklist
                    ? checklist.dismissed
                        ? 'Checklist closed'
                        : 'Checklist open'
                    : 'Loading checklist'}
            </span>
        );
    };
    render(
        <FloatingOnboardingChecklistProvider>
            <HelpResources />
            <ChecklistStatus />
        </FloatingOnboardingChecklistProvider>,
        { permissions: [{ permission: ADMIN }], route: '/personal' },
    );
    expect(await screen.findByText('Checklist closed')).toBeInTheDocument();

    await userEvent.click(
        screen.getByRole('button', { name: 'Help and resources' }),
    );
    await userEvent.click(
        await screen.findByRole('menuitem', { name: /Get started/ }),
    );

    expect(await screen.findByText('Checklist open')).toBeInTheDocument();
});

test("hides Get started until the user's eligibility is known", async () => {
    mockUserWithSplash(server, {});

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

const withSearchDocsWidget = () =>
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { searchDocsWidget: true },
    });

test('groups the menu items for the new sidebar with Search docs among the docs resources', async () => {
    withSearchDocsWidget();
    render(<HelpResources variant='sidebar' />);

    await userEvent.click(
        await screen.findByRole('button', { name: 'Help and resources' }),
    );
    await screen.findByRole('menuitem', { name: 'Search docs' });

    expect(
        Array.from(screen.getByRole('menu').children, (item) =>
            item.tagName === 'HR' ? '---' : item.textContent,
        ),
    ).toEqual([
        expect.stringContaining('Visit Learning Lab'),
        'Unleash Intro',
        '---',
        'Search docs',
        'Documentation',
        'Learning Lab',
        "What's new",
        '---',
        'GitHub',
        'Slack community',
        'Give feedback',
    ]);
});

const openSearchDocsFromMenu = async () => {
    await userEvent.click(
        await screen.findByRole('button', { name: 'Help and resources' }),
    );
    await userEvent.click(
        await screen.findByRole('menuitem', { name: 'Search docs' }),
    );
};

test('opens the docs chat from the Search docs item', async () => {
    withSearchDocsWidget();
    render(<HelpResources variant='sidebar' />);

    await openSearchDocsFromMenu();

    expect(await screen.findByText('Docs chat')).toBeInTheDocument();
    await waitFor(() =>
        expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
});

test('reopens the docs chat from the menu after the chat was closed', async () => {
    withSearchDocsWidget();
    render(<HelpResources variant='sidebar' />);
    await openSearchDocsFromMenu();
    await userEvent.click(
        await screen.findByRole('button', { name: 'Close docs chat' }),
    );
    await waitFor(() =>
        expect(screen.queryByText('Docs chat')).not.toBeInTheDocument(),
    );

    await openSearchDocsFromMenu();

    expect(await screen.findByText('Docs chat')).toBeInTheDocument();
});
