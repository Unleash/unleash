import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, expect, test } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { ADMIN } from 'component/providers/AccessProvider/permissions';
import { InstanceState } from 'interfaces/instance';
import {
    CancelledSubscriptionNotice,
    CancelSubscription,
} from './SubscriptionCancellation.tsx';

const SubscriptionCancellation = () => (
    <>
        <CancelledSubscriptionNotice />
        <CancelSubscription />
    </>
);

const server = testServerSetup();

const setup = ({
    billing = 'pay-as-you-go',
    subscriptionAccessEndsAt,
}: {
    billing?: string;
    subscriptionAccessEndsAt?: string;
} = {}) => {
    testServerRoute(server, '/api/admin/ui-config', {
        billing,
        flags: { UNLEASH_CLOUD: true, subscriptionCancellation: true },
    });
    testServerRoute(server, '/api/instance/status', {
        plan: 'Enterprise',
        billing,
        state: InstanceState.ACTIVE,
        subscriptionAccessEndsAt,
    });
    testServerRoute(server, '/api/admin/invoices/list', {
        invoices: [
            {
                status: 'upcoming',
                invoiceDate: '2026-12-05T00:00:00.000Z',
                periodStart: '2026-11-05T00:00:00.000Z',
                periodEnd: '2026-12-05T00:00:00.000Z',
                totalAmount: 0,
                subtotal: 0,
                currency: 'usd',
                taxAmount: 0,
                taxPercentage: 0,
                mainLines: [],
                usageLines: [],
                monthText: 'December 2026',
            },
        ],
    });
};

beforeEach(() => {
    setup();
});

afterEach(() => {
    server.events.removeAllListeners();
});

test('cancels with the picked reason and the optional details', async () => {
    const { requests } = testServerRoute(
        server,
        '/api/instance/subscription/cancel',
        { accessEndsAt: '2026-12-05T00:00:00.000Z' },
        'post',
    );
    render(<SubscriptionCancellation />, {
        permissions: [{ permission: ADMIN }],
    });

    fireEvent.click(
        await screen.findByRole('button', { name: 'Cancel subscription' }),
    );
    const dialog = await screen.findByRole('dialog');
    expect(
        within(dialog).getByText(/Your subscription ends on December 5, 2026/),
    ).toBeInTheDocument();
    expect(
        within(dialog).getByText(/deleted after December 19, 2026/),
    ).toBeInTheDocument();
    const confirm = within(dialog).getByRole('button', {
        name: 'Cancel subscription',
    });
    expect(confirm).toBeDisabled();

    fireEvent.mouseDown(within(dialog).getByRole('combobox'));
    fireEvent.click(
        await screen.findByRole('option', { name: 'Too expensive' }),
    );
    fireEvent.change(
        within(dialog).getByLabelText("Anything you'd like to add?"),
        { target: { value: '  Budget cut  ' } },
    );
    fireEvent.click(confirm);

    await waitFor(() =>
        expect(requests).toEqual([{ reason: 'Too expensive: Budget cut' }]),
    );
});

test('keeping the subscription closes the dialog without cancelling', async () => {
    const { requests } = testServerRoute(
        server,
        '/api/instance/subscription/cancel',
        {},
        'post',
    );
    render(<SubscriptionCancellation />, {
        permissions: [{ permission: ADMIN }],
    });

    fireEvent.click(
        await screen.findByRole('button', { name: 'Cancel subscription' }),
    );
    fireEvent.click(
        await screen.findByRole('button', { name: 'Keep subscription' }),
    );

    await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(requests).toEqual([]);
});

test('offers to resume a cancelled subscription', async () => {
    setup({ subscriptionAccessEndsAt: '2026-12-05T00:00:00.000Z' });
    let resumed = false;
    server.use(
        http.post('/api/instance/subscription/resume', () => {
            resumed = true;
            return new HttpResponse(null, { status: 200 });
        }),
    );
    render(<SubscriptionCancellation />, {
        permissions: [{ permission: ADMIN }],
    });

    expect(
        await screen.findByText('Subscription cancelled'),
    ).toBeInTheDocument();
    expect(
        screen.getByText(
            /ends on December 5, 2026. The instance will be deleted after December 19, 2026/,
        ),
    ).toBeInTheDocument();
    expect(
        screen.queryByRole('button', { name: 'Cancel subscription' }),
    ).not.toBeInTheDocument();
    fireEvent.click(
        screen.getByRole('button', { name: 'Resume subscription' }),
    );

    await waitFor(() => expect(resumed).toBe(true));
});

test.each([
    { label: 'non-admins', permission: 'NONE', billing: 'pay-as-you-go' },
    { label: 'non-PAYG instances', permission: ADMIN, billing: 'subscription' },
])('is hidden for $label', async ({ permission, billing }) => {
    setup({ billing });
    const loaded: string[] = [];
    server.events.on('response:mocked', ({ request }) => {
        loaded.push(new URL(request.url).pathname);
    });
    render(<SubscriptionCancellation />, { permissions: [{ permission }] });

    await waitFor(() =>
        expect(loaded).toEqual(
            expect.arrayContaining([
                '/api/admin/ui-config',
                '/api/instance/status',
            ]),
        ),
    );
    expect(
        screen.queryByRole('button', { name: 'Cancel subscription' }),
    ).not.toBeInTheDocument();
    expect(
        screen.queryByText('Subscription cancelled'),
    ).not.toBeInTheDocument();
});
