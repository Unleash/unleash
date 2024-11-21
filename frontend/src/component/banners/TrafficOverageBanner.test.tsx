import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { TrafficOverageBanner } from './TrafficOverageBanner';
import { toSelectablePeriod } from 'hooks/useTrafficData';
import { BILLING_INCLUDED_REQUESTS } from 'component/admin/billing/BillingDashboard/BillingPlan/BillingPlan';

const server = testServerSetup();

const setupApi = (totalRequests = 0) => {
    const period = toSelectablePeriod(new Date()).key;

    testServerRoute(server, '/api/admin/ui-config', {
        environment: 'Enterprise',
        versionInfo: {
            current: {
                enterprise: 'Enterprise',
            },
        },
        billing: 'pay-as-you-go',
        flags: {
            'enterprise-payg': true,
            estimateTrafficDataCost: true,
        },
    });

    testServerRoute(server, `/api/admin/metrics/traffic/${period}`, {
        period,
        apiData: [
            {
                apiPath: '/api/client',
                days: [
                    {
                        day: `${period}-01T00:00:00.000Z`,
                        trafficTypes: [
                            {
                                group: 'successful-requests',
                                count: totalRequests,
                            },
                        ],
                    },
                ],
            },
        ],
    });
};

test('Displays overage banner when overage cost is calculated', async () => {
    setupApi(BILLING_INCLUDED_REQUESTS + 1_000_000);

    render(<TrafficOverageBanner />);

    const bannerMessage = await screen.findByText(
        /You're using more requests than your plan/,
    );
    expect(bannerMessage).toBeInTheDocument();
});

test('Displays estimated monthly cost banner when usage is projected to exceed', async () => {
    setupApi(BILLING_INCLUDED_REQUESTS - 1_000_000);

    render(<TrafficOverageBanner />);

    const bannerMessage = await screen.findByText(
        /Based on your current usage, you're projected to exceed your plan/,
    );
    expect(bannerMessage).toBeInTheDocument();
});

test('Does not display banner when no overage or estimated cost', async () => {
    setupApi();

    render(<TrafficOverageBanner />);

    expect(screen.queryByText('Heads up!')).not.toBeInTheDocument();
});
