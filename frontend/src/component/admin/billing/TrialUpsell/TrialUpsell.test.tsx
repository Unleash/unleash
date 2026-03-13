import { type MockedFunction, vi } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TrialUpsell } from './TrialUpsell';
import { useInstancePrices } from 'hooks/api/getters/useInstancePrices/useInstancePrices';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { InstancePlan, InstanceState } from 'interfaces/instance';

vi.mock('hooks/api/getters/useInstancePrices/useInstancePrices');
vi.mock('hooks/api/getters/useInstanceStatus/useInstanceStatus');

const mockUseInstancePrices = useInstancePrices as MockedFunction<
    typeof useInstancePrices
>;
const mockUseInstanceStatus = useInstanceStatus as MockedFunction<
    typeof useInstanceStatus
>;

const defaultPrices = {
    instancePrices: {
        pro: { base: 80, seat: 15, traffic: 5 },
        payg: { seat: 20, traffic: 5 },
    },
    loading: false,
    refetch: vi.fn(),
    error: undefined,
};

const defaultStatus = {
    instanceStatus: {
        plan: InstancePlan.PRO,
        state: InstanceState.TRIAL,
        trialExpiry: '2026-03-19T23:59:59.999Z',
    },
    refetchInstanceStatus: vi.fn(),
    refresh: vi.fn().mockResolvedValue(undefined),
    isBilling: false,
    loading: false,
    error: undefined,
};

describe('TrialUpsell', () => {
    beforeEach(() => {
        mockUseInstancePrices.mockReturnValue(defaultPrices);
        mockUseInstanceStatus.mockReturnValue(defaultStatus);
    });

    it('shows pricing, expiry date, trusted logos, and upgrade button for admins', () => {
        render(<TrialUpsell />, {
            permissions: [{ permission: ADMIN }],
        });

        expect(screen.getByText(/\$20/)).toBeInTheDocument();
        expect(screen.getByText(/per user billed monthly/)).toBeInTheDocument();
        expect(screen.getByText('Pay by credit card')).toBeInTheDocument();
        expect(screen.getByText('Cancel anytime')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /upgrade now/i }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Your trial expires on 03\/19\/2026/),
        ).toBeInTheDocument();
        expect(
            screen.getByText('Trusted by enterprises like'),
        ).toBeInTheDocument();
    });

    it('shows contact-admin alert for non-admins and hides pricing', () => {
        render(<TrialUpsell />, { permissions: [] });

        expect(
            screen.getByText(/Contact your account admin/),
        ).toBeInTheDocument();
        expect(screen.queryByText(/per user billed/)).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: /upgrade now/i }),
        ).not.toBeInTheDocument();
    });

    it('falls back to "soon" when no trialExpiry is provided', () => {
        mockUseInstanceStatus.mockReturnValue({
            ...defaultStatus,
            instanceStatus: {
                plan: InstancePlan.PRO,
                state: InstanceState.TRIAL,
            },
        });

        render(<TrialUpsell />, {
            permissions: [{ permission: ADMIN }],
        });

        expect(screen.getByText(/expires soon/)).toBeInTheDocument();
    });

    it('shows expired title and message when trial has expired', () => {
        mockUseInstanceStatus.mockReturnValue({
            ...defaultStatus,
            instanceStatus: {
                plan: InstancePlan.PRO,
                state: InstanceState.EXPIRED,
            },
        });

        render(<TrialUpsell />, {
            permissions: [{ permission: ADMIN }],
        });

        expect(
            screen.getByRole('heading', {
                name: 'Upgrade to continue using Unleash',
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Your free trial has expired/),
        ).toBeInTheDocument();
        expect(screen.queryByText(/14 day free trial/)).not.toBeInTheDocument();
    });

    it('navigates to checkout when upgrade button is clicked', async () => {
        const assignMock = vi.fn();
        vi.stubGlobal('location', { assign: assignMock });

        render(<TrialUpsell />, {
            permissions: [{ permission: ADMIN }],
        });

        await userEvent.click(
            screen.getByRole('button', { name: /upgrade now/i }),
        );

        expect(assignMock).toHaveBeenCalledWith(
            expect.stringContaining('api/admin/invoices/checkout'),
        );

        vi.unstubAllGlobals();
    });
});
