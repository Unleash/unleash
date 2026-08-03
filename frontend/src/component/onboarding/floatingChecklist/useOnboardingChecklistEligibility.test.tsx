import type { FC } from 'react';
import { expect, test } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { ADMIN } from 'component/providers/AccessProvider/permissions.ts';
import { useOnboardingChecklistEligibility } from './useOnboardingChecklistEligibility.ts';

const server = testServerSetup();

const TestComponent: FC = () => {
    const eligible = useOnboardingChecklistEligibility();
    return <div>{eligible ? 'eligible' : 'not-eligible'}</div>;
};

const mockUser = (id: number) =>
    testServerRoute(server, '/api/admin/user', {
        user: { id },
        permissions: [],
        feedback: [],
        splash: {},
    });

const mockFlag = (enabled: boolean) =>
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { floatingOnboardingChecklist: enabled },
    });

test('is not eligible when the floatingOnboardingChecklist flag is off', async () => {
    mockFlag(false);
    mockUser(1);

    render(<TestComponent />, { permissions: [{ permission: ADMIN }] });

    expect(await screen.findByText('not-eligible')).toBeInTheDocument();
});

test('non-admin is not eligible even when user id is 1', async () => {
    mockFlag(true);
    mockUser(1);

    render(<TestComponent />);

    expect(await screen.findByText('not-eligible')).toBeInTheDocument();
});

test('admin with user id other than 1 is not eligible', async () => {
    mockFlag(true);
    mockUser(2);

    render(<TestComponent />, { permissions: [{ permission: ADMIN }] });

    expect(await screen.findByText('not-eligible')).toBeInTheDocument();
});

test('admin with user id 1 is eligible', async () => {
    mockFlag(true);
    mockUser(1);

    render(<TestComponent />, { permissions: [{ permission: ADMIN }] });

    expect(await screen.findByText('eligible')).toBeInTheDocument();
});
