import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
    type MockedFunction,
} from 'vitest';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TrialUpsell } from './TrialUpsell';
import { useInstancePrices } from 'hooks/api/getters/useInstancePrices/useInstancePrices';
import { useInstanceStatus } from 'hooks/api/getters/useInstanceStatus/useInstanceStatus';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import {
    type InstanceCredit,
    InstancePlan,
    InstanceState,
} from 'interfaces/instance';
import { useInstanceCredits } from 'hooks/api/getters/useInstanceCredits/useInstanceCredits';

vi.mock('hooks/api/getters/useInstancePrices/useInstancePrices');
vi.mock('hooks/api/getters/useInstanceStatus/useInstanceStatus');
vi.mock('hooks/api/getters/useInstanceCredits/useInstanceCredits');

const mockUseInstancePrices = useInstancePrices as MockedFunction<
    typeof useInstancePrices
>;
const mockUseInstanceStatus = useInstanceStatus as MockedFunction<
    typeof useInstanceStatus
>;

const mockUseInstanceCredits = useInstanceCredits as MockedFunction<
    typeof useInstanceCredits
>;

const credit = (
    code: string,
    amountCents: number,
    offerStatus: 'active' | 'ended',
    status: InstanceCredit['status'] = 'attached',
): InstanceCredit => ({
    source: 'campaign',
    status,
    amountCents,
    usedCents: 0,
    campaign: {
        code,
        name: `${code} campaign`,
        redeemableUntil: '2026-12-31T23:59:59.999Z',
        offerStatus,
    },
});

const withCredits = (credits: InstanceCredit[]) =>
    mockUseInstanceCredits.mockReturnValue({ credits, loading: false });

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
        trialExpiry: '2028-03-19T23:59:59.999Z',
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
        withCredits([]);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('sums the active offers and lists each with its amount', () => {
        withCredits([
            credit('LENNY1K', 100000, 'active'),
            credit('HALF', 50000, 'active', 'granted'),
            credit('OLD', 25000, 'ended'),
        ]);

        render(<TrialUpsell />, { permissions: [{ permission: ADMIN }] });

        expect(
            screen.getByText('You get $1,500 in credit'),
        ).toBeInTheDocument();
        expect(
            screen.getByText('From LENNY1K campaign · code LENNY1K · $1,000'),
        ).toBeInTheDocument();
        expect(
            screen.getByText('From HALF campaign · code HALF · $500'),
        ).toBeInTheDocument();
        expect(
            screen.getByText('OLD · $250 · This offer has ended'),
        ).toBeInTheDocument();
    });

    it('leaves the amount off the line when there is a single active offer', () => {
        withCredits([credit('LENNY1K', 100000, 'active')]);

        render(<TrialUpsell />, { permissions: [{ permission: ADMIN }] });

        expect(
            screen.getByText('From LENNY1K campaign · code LENNY1K'),
        ).toBeInTheDocument();
    });

    it('shows when the offer ends, with the exact date on hover', async () => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime('2026-12-17T23:59:59.999Z');
        withCredits([credit('LENNY1K', 100000, 'active')]);

        render(<TrialUpsell />, { permissions: [{ permission: ADMIN }] });
        const deadline = screen.getByText('in 14 days');
        await userEvent.hover(deadline);

        expect(deadline.closest('p')).toHaveTextContent(
            'Limited offer: ends in 14 days, while spots last.',
        );
        expect(await screen.findByRole('tooltip')).toHaveTextContent(
            /^12\/31\/2026, 11:59\sPM$/,
        );
    });

    it('asks for card payment to use the active credit', () => {
        withCredits([credit('LENNY1K', 100000, 'active')]);

        render(<TrialUpsell />, { permissions: [{ permission: ADMIN }] });

        expect(
            screen.getByText('Upgrade and add a card to use it.'),
        ).toBeInTheDocument();
        expect(
            screen.getByText('Pay by credit card to use your credit'),
        ).toBeInTheDocument();
        expect(
            screen.queryByText('Pay by credit card'),
        ).not.toBeInTheDocument();
    });

    it('keeps the plain card payment copy when every offer has ended', () => {
        withCredits([credit('OLD', 100000, 'ended')]);

        render(<TrialUpsell />, { permissions: [{ permission: ADMIN }] });

        expect(screen.queryByText(/in credit$/)).not.toBeInTheDocument();
        expect(screen.getByText('Pay by credit card')).toBeInTheDocument();
    });

    it('blocks the upgrade until the credits load', () => {
        mockUseInstanceCredits.mockReturnValue({ credits: [], loading: true });

        render(<TrialUpsell />, { permissions: [{ permission: ADMIN }] });

        expect(
            screen
                .getByRole('button', { name: /upgrade now/i })
                .closest('.skeleton'),
        ).toBeInTheDocument();
    });

    it('shows no offer to non-admins', () => {
        withCredits([credit('LENNY1K', 100000, 'active')]);

        render(<TrialUpsell />, { permissions: [] });

        expect(screen.queryByText(/in credit$/)).not.toBeInTheDocument();
    });

    it('shows no offer when no credit can be redeemed', () => {
        withCredits([
            credit('USED', 100000, 'active', 'redeemed'),
            credit('GONE', 100000, 'active', 'expired'),
        ]);

        render(<TrialUpsell />, { permissions: [{ permission: ADMIN }] });

        expect(screen.queryByText(/in credit$/)).not.toBeInTheDocument();
        expect(screen.getByText('Pay by credit card')).toBeInTheDocument();
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
            screen.getByText(/Your trial expires on 03\/19\/2028/),
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
