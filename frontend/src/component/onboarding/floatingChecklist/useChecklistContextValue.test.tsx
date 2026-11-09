import type { FC } from 'react';
import { beforeEach, expect, test } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { ADMIN } from 'component/providers/AccessProvider/permissions.ts';
import { createLocalStorage } from 'utils/createLocalStorage.ts';
import {
    CHECKLIST_PROJECT_ID,
    useChecklistContextValue,
} from './useChecklistContextValue.ts';
import { ONBOARDING_INTRO_FINISHED_SPLASH_ID } from 'component/onboarding/intro/IntroProvider.tsx';
import { ONBOARDING_CHECKLIST_SPLASH_ID } from './useOnboardingChecklistEligibility.ts';
import {
    ONBOARDING_CHECKLIST_ELIGIBILITY_DECIDED_SPLASH_ID,
    ONBOARDING_CHECKLIST_ELIGIBLE_SPLASH_ID,
} from './useOnboardingChecklistVisibility.ts';
import type { FloatingOnboardingChecklistState } from './floatingOnboardingChecklistState.ts';

const server = testServerSetup();

const TestComponent: FC = () => {
    const value = useChecklistContextValue();
    if (!value) return <div>null</div>;
    const { done, completedCount, totalSteps, dismissed, open } = value;

    return (
        <div>
            <span data-testid='count'>
                {completedCount}/{totalSteps}
            </span>
            <span data-testid='tour'>{done.tour ? 'y' : 'n'}</span>
            <span data-testid='flag'>{done.flag ? 'y' : 'n'}</span>
            <span data-testid='sdk'>{done.sdk ? 'y' : 'n'}</span>
            <span data-testid='on'>{done.on ? 'y' : 'n'}</span>
            <span data-testid='dismissed'>{dismissed ? 'y' : 'n'}</span>
            <button type='button' onClick={open}>
                Open checklist
            </button>
        </div>
    );
};

const mockEligibleUser = ({
    splash = {},
    dashboardV2 = false,
}: {
    splash?: Record<string, boolean>;
    dashboardV2?: boolean;
} = {}) => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { dashboardV2 },
    });
    testServerRoute(server, '/api/admin/user', {
        user: { id: 1 },
        permissions: [],
        feedback: [],
        splash: {
            [ONBOARDING_CHECKLIST_ELIGIBILITY_DECIDED_SPLASH_ID]: true,
            [ONBOARDING_CHECKLIST_ELIGIBLE_SPLASH_ID]: true,
            ...splash,
        },
    });
};

const defaultProjectOverview = {
    featureTypeCounts: [],
    environments: [],
    name: 'Default',
    health: 0,
    members: 0,
    version: 1,
    description: 'Default',
    favorite: false,
    mode: 'open',
    defaultStickiness: 'default',
};

const mockProjectOverview = (
    onboardingStatus: 'onboarding-started' | 'sdk-connected' | 'onboarded',
) =>
    testServerRoute(
        server,
        `/api/admin/projects/${CHECKLIST_PROJECT_ID}/overview`,
        {
            ...defaultProjectOverview,
            onboardingStatus: { status: onboardingStatus },
        },
    );

const seedState = (patch: Partial<FloatingOnboardingChecklistState>) => {
    const base: FloatingOnboardingChecklistState = {
        minimized: false,
        completed: {},
    };
    createLocalStorage<FloatingOnboardingChecklistState>(
        'floating-onboarding:v1',
        base,
    ).setValue({ ...base, ...patch });
};

beforeEach(() => {
    window.localStorage.clear();
});

test('shows completed count matching the server progress', async () => {
    mockEligibleUser();
    mockProjectOverview('sdk-connected');

    render(<TestComponent />, { permissions: [{ permission: ADMIN }] });

    expect(await screen.findByTestId('flag')).toHaveTextContent('y');
    expect(await screen.findByTestId('sdk')).toHaveTextContent('y');
    expect(await screen.findByTestId('on')).toHaveTextContent('n');
    expect(await screen.findByTestId('count')).toHaveTextContent('2/4');
    expect(screen.getByTestId('dismissed')).toHaveTextContent('n');
});

test('keeps the flag step ticked while the server still reports it incomplete', async () => {
    seedState({ completed: { flag: true } });
    mockEligibleUser();
    mockProjectOverview('onboarding-started');

    render(<TestComponent />, { permissions: [{ permission: ADMIN }] });

    expect(await screen.findByTestId('flag')).toHaveTextContent('y');
    expect(await screen.findByTestId('sdk')).toHaveTextContent('n');
    expect(await screen.findByTestId('on')).toHaveTextContent('n');
});

test('stays dismissed for a returning user whose dismissal is persisted server-side', async () => {
    mockEligibleUser({ splash: { [ONBOARDING_CHECKLIST_SPLASH_ID]: true } });
    mockProjectOverview('onboarding-started');

    render(<TestComponent />, { permissions: [{ permission: ADMIN }] });

    expect(await screen.findByTestId('dismissed')).toHaveTextContent('y');
});

test('keeps the tour step ticked for a returning user who already finished it', async () => {
    mockEligibleUser({
        splash: { [ONBOARDING_INTRO_FINISHED_SPLASH_ID]: true },
    });
    mockProjectOverview('onboarding-started');

    render(<TestComponent />, { permissions: [{ permission: ADMIN }] });

    expect(await screen.findByTestId('tour')).toHaveTextContent('y');
});

test('stays visible on next load after the user reopens a dismissed checklist', async () => {
    seedState({ dismissed: false });
    mockEligibleUser({
        dashboardV2: true,
        splash: { [ONBOARDING_CHECKLIST_SPLASH_ID]: true },
    });
    mockProjectOverview('onboarding-started');

    render(<TestComponent />, { permissions: [{ permission: ADMIN }] });

    expect(await screen.findByTestId('dismissed')).toHaveTextContent('n');
});

test.each(['/personal', '/projects/default'])(
    'starts closed on %s when dashboard V2 is enabled',
    async (route) => {
        mockEligibleUser({ dashboardV2: true });
        mockProjectOverview('onboarding-started');

        render(<TestComponent />, {
            permissions: [{ permission: ADMIN }],
            route,
        });

        expect(await screen.findByTestId('dismissed')).toHaveTextContent('y');
    },
);

test('opening the checklist keeps it open across project and dashboard page loads', async () => {
    seedState({ completed: { flag: true } });
    mockEligibleUser({ dashboardV2: true });
    mockProjectOverview('onboarding-started');
    const options = { permissions: [{ permission: ADMIN }] };
    const user = userEvent.setup();
    const dashboard = render(<TestComponent />, {
        ...options,
        route: '/personal',
    });
    expect(await screen.findByTestId('dismissed')).toHaveTextContent('y');

    await user.click(screen.getByRole('button', { name: 'Open checklist' }));

    expect(screen.getByTestId('dismissed')).toHaveTextContent('n');
    expect(screen.getByTestId('flag')).toHaveTextContent('y');
    dashboard.unmount();

    const project = render(<TestComponent />, {
        ...options,
        route: '/projects/default',
    });
    expect(await screen.findByTestId('dismissed')).toHaveTextContent('n');
    expect(screen.getByTestId('flag')).toHaveTextContent('y');
    project.unmount();

    render(<TestComponent />, { ...options, route: '/personal' });

    expect(await screen.findByTestId('dismissed')).toHaveTextContent('n');
});

test('stays hidden when the default project cannot be loaded', async () => {
    mockEligibleUser();
    testServerRoute(
        server,
        `/api/admin/projects/${CHECKLIST_PROJECT_ID}/overview`,
        { message: 'not found' },
        'get',
        404,
    );

    render(<TestComponent />, { permissions: [{ permission: ADMIN }] });

    expect(await screen.findByText('null')).toBeInTheDocument();
});
