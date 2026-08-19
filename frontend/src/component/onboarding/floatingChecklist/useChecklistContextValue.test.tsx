import type { FC } from 'react';
import { beforeEach, expect, test } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
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
    const { done, completedCount, totalSteps, dismissed } = value;

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
        </div>
    );
};

const mockEligibleUser = ({
    splash = {},
    quickTour = false,
}: {
    splash?: Record<string, boolean>;
    quickTour?: boolean;
} = {}) => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: {
            floatingOnboardingChecklist: true,
            onboardingIntroTour: quickTour,
        },
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
    expect(await screen.findByTestId('count')).toHaveTextContent('2/3');
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
    mockEligibleUser({ splash: { [ONBOARDING_CHECKLIST_SPLASH_ID]: true } });
    mockProjectOverview('onboarding-started');

    render(<TestComponent />, { permissions: [{ permission: ADMIN }] });

    expect(await screen.findByTestId('dismissed')).toHaveTextContent('n');
});

test('shows the tour step alongside the other three when the quick tour flag is on', async () => {
    mockEligibleUser({ quickTour: true });
    mockProjectOverview('onboarding-started');

    render(<TestComponent />, { permissions: [{ permission: ADMIN }] });

    expect(await screen.findByTestId('count')).toHaveTextContent('0/4');
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
