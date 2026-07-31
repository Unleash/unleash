import type { FC } from 'react';
import { beforeEach, expect, test } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { ADMIN } from 'component/providers/AccessProvider/permissions.ts';
import { createLocalStorage } from 'utils/createLocalStorage.ts';
import { useChecklistContextValue } from './useChecklistContextValue.ts';
import { ONBOARDING_CHECKLIST_SPLASH_ID } from './useOnboardingChecklistEligibility.ts';
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
            <span data-testid='flag'>{done.flag ? 'y' : 'n'}</span>
            <span data-testid='sdk'>{done.sdk ? 'y' : 'n'}</span>
            <span data-testid='on'>{done.on ? 'y' : 'n'}</span>
            <span data-testid='dismissed'>{dismissed ? 'y' : 'n'}</span>
        </div>
    );
};

const mockEligibleUser = (splash: Record<string, boolean> = {}) => {
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

const mockProjectOverview = (
    onboardingStatus: 'onboarding-started' | 'sdk-connected' | 'onboarded',
) =>
    testServerRoute(server, '/api/admin/projects/default/overview', {
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
        onboardingStatus: { status: onboardingStatus },
    });

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

test('done and completedCount derive from server onboardingStatus', async () => {
    mockEligibleUser();
    mockProjectOverview('sdk-connected');

    render(<TestComponent />, { permissions: [{ permission: ADMIN }] });

    expect(await screen.findByTestId('flag')).toHaveTextContent('y');
    expect(await screen.findByTestId('sdk')).toHaveTextContent('y');
    expect(await screen.findByTestId('on')).toHaveTextContent('n');
    expect(await screen.findByTestId('count')).toHaveTextContent('2/3');
});

test('local completed state marks steps done even when server says otherwise', async () => {
    seedState({ completed: { flag: true, sdk: true, on: true } });
    mockEligibleUser();
    mockProjectOverview('onboarding-started');

    render(<TestComponent />, { permissions: [{ permission: ADMIN }] });

    expect(await screen.findByTestId('flag')).toHaveTextContent('y');
    expect(await screen.findByTestId('sdk')).toHaveTextContent('y');
    expect(await screen.findByTestId('on')).toHaveTextContent('y');
    expect(await screen.findByTestId('count')).toHaveTextContent('3/3');
});

test('server splash keeps checklist dismissed after a fresh login', async () => {
    mockEligibleUser({ [ONBOARDING_CHECKLIST_SPLASH_ID]: true });
    mockProjectOverview('onboarding-started');

    render(<TestComponent />, { permissions: [{ permission: ADMIN }] });

    expect(await screen.findByTestId('dismissed')).toHaveTextContent('y');
});

test('local dismissed=false overrides server splash (post-reopen)', async () => {
    seedState({ dismissed: false });
    mockEligibleUser({ [ONBOARDING_CHECKLIST_SPLASH_ID]: true });
    mockProjectOverview('onboarding-started');

    render(<TestComponent />, { permissions: [{ permission: ADMIN }] });

    expect(await screen.findByTestId('dismissed')).toHaveTextContent('n');
});
