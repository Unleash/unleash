import { PersonalDashboard } from './PersonalDashboard';
import { render } from 'utils/testRenderer';
import { fireEvent, screen } from '@testing-library/react';
import { testServerRoute, testServerSetup } from '../../utils/testServer';

const server = testServerSetup();

testServerRoute(server, '/api/admin/user', {
    user: {
        name: 'Unleash User',
    },
});

testServerRoute(server, '/api/admin/personal-dashboard', {
    projects: [
        {
            id: 'projectId',
            memberCount: 10,
            featureCount: 100,
            health: 80,
            name: 'projectName',
        },
    ],
    flags: [
        {
            name: 'myFlag',
            project: 'projectId',
            type: 'release',
        },
    ],
});

testServerRoute(server, '/api/admin/personal-dashboard/projectId', {
    onboardingStatus: { status: 'onboarded' },
    insights: {
        avgHealthCurrentWindow: 80,
        avgHealthPastWindow: 70,
    },
    latestEvents: [{ summary: 'someone created a flag', id: 0 }],
    roles: [{ name: 'Member' }],
    owners: [
        [
            {
                name: 'Some Owner',
                ownerType: 'user',
                email: 'owner@example.com',
                imageUrl: 'url',
            },
        ],
    ],
});

testServerRoute(server, '/api/admin/projects/projectId/features/myFlag', {
    environments: [
        { name: 'development', type: 'development' },
        { name: 'production', type: 'production' },
    ],
    children: [],
});

// @ts-ignore
HTMLCanvasElement.prototype.getContext = () => {};

test('Render personal dashboard', async () => {
    render(<PersonalDashboard />);

    const welcomeDialogClose = await screen.findByText(
        "Got it, let's get started!",
    );

    fireEvent.click(welcomeDialogClose);

    await screen.findByText('Welcome Unleash User');
    await screen.findByText('projectName');
    await screen.findByText('10'); // members
    await screen.findByText('100'); // features
    await screen.findByText('80%'); // health

    await screen.findByText(
        'We have gathered projects and flags you have favorited or owned',
    );
    await screen.findByText('Project Insight');
    await screen.findByText('70%');
    await screen.findByText('someone created a flag');
    await screen.findByText('Member');

    await screen.findByText('myFlag');
    await screen.findByText('No feature flag metrics data');
    await screen.findByText('production');
    await screen.findByText('Last 48 hours');
});
