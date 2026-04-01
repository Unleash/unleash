import { vi } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { Billing } from './Billing';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { InstancePlan, InstanceState } from 'interfaces/instance';
import { addDays } from 'date-fns';

vi.mock(
    'hooks/api/getters/useInstanceStatus/useInstanceStatus',
    async (importOriginal) => {
        const mod =
            await importOriginal<
                typeof import('hooks/api/getters/useInstanceStatus/useInstanceStatus')
            >();
        return {
            ...mod,
            useInstanceStatus: () => ({
                ...mod.useInstanceStatus(),
                refresh: vi.fn().mockResolvedValue(undefined),
            }),
        };
    },
);

const server = testServerSetup();

beforeEach(() => {
    testServerRoute(server, '/api/admin/ui-config', {
        billing: 'pay-as-you-go',
        flags: { UNLEASH_CLOUD: true },
    });
    testServerRoute(server, '/api/instance/status', {
        plan: InstancePlan.PRO,
        state: InstanceState.TRIAL,
        billing: 'pay-as-you-go',
        trialExpiry: addDays(new Date(), 14).toISOString(),
    });
    testServerRoute(server, '/api/admin/invoices', { invoices: [] });
    testServerRoute(server, '/api/instance/prices', {});
});

test('shows trial upsell for pay-as-you-go trial with no invoices for admins', async () => {
    render(<Billing />, { permissions: [{ permission: 'ADMIN' }] });

    expect(await screen.findByText('14 day free trial')).toBeInTheDocument();
});

test('shows trial upsell for pay-as-you-go trial with no invoices for users', async () => {
    render(<Billing />, { permissions: [{ permission: 'NONE' }] });

    expect(
        await screen.findByText(
            'Contact your account admin to request an upgrade.',
        ),
    ).toBeInTheDocument();
});
