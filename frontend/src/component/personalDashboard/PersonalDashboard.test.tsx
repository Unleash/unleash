import { PersonalDashboard } from './PersonalDashboard';
import { render } from 'utils/testRenderer';
import { fireEvent, screen } from '@testing-library/react';
import { testServerRoute, testServerSetup } from '../../utils/testServer';

const server = testServerSetup();

const setupLongRunningProject = () => {
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
            totalFlags: 39,
            potentiallyStaleFlags: 14,
            staleFlags: 13,
            activeFlags: 12,
            health: 81,
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
};

const setupNewProject = () => {
    testServerRoute(server, '/api/admin/user', {
        user: {
            name: 'Unleash User',
        },
    });

    testServerRoute(server, '/api/admin/personal-dashboard', {
        projects: [
            {
                id: 'projectId',
                memberCount: 3,
                featureCount: 0,
                health: 100,
                name: 'projectName',
            },
        ],
        flags: [],
    });

    testServerRoute(server, '/api/admin/personal-dashboard/projectId', {
        onboardingStatus: { status: 'onboarding-started' },
        insights: {
            avgHealthCurrentWindow: null,
            avgHealthPastWindow: null,
        },
        latestEvents: [],
        roles: [],
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
};

// @ts-expect-error The return type here isn't correct, but it's not
// an issue for the tests. We just need to override it because it's
// not implemented in jsdom.
HTMLCanvasElement.prototype.getContext = () => {};

//scrollIntoView is not implemented in jsdom
HTMLElement.prototype.scrollIntoView = () => {};

test('Render personal dashboard for a long running project', async () => {
    setupLongRunningProject();
    render(<PersonalDashboard />);

    const welcomeDialogClose = await screen.findByText(
        "Got it, let's get started!",
    );

    fireEvent.click(welcomeDialogClose);

    await screen.findByText('Welcome Unleash User');
    await screen.findByText('projectName');
    await screen.findByText('10'); // members
    await screen.findByText('100'); // features
    await screen.findAllByText('80%'); // health

    await screen.findByText('Project health');
    await screen.findByText('70%'); // avg health past window
    await screen.findByText('someone created a flag');
    await screen.findByText('Member');
    await screen.findByText('myFlag');
    await screen.findByText('production');
    await screen.findByText('Last 48 hours');
});

test('Render personal dashboard for a new project', async () => {
    setupNewProject();
    render(<PersonalDashboard />);

    await screen.findByText('Welcome Unleash User');
    await screen.findByText('projectName');
    await screen.findByText('3'); // members
    await screen.findByText('0'); // features
    await screen.findByText('100%'); // health

    await screen.findByText('Create a feature flag');
    await screen.findByText('Connect an SDK');
    await screen.findByText('You have no project roles in this project.');
    await screen.findByText(
        'You have not created or favorited any feature flags. Once you do, they will show up here.',
    );
});
