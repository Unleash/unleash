import { PersonalDashboard } from './PersonalDashboard.tsx';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { WelcomeDialogProvider } from './WelcomeDialogProvider.tsx';

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
                techicalDebt: 20,
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
            technicalDebt: 19,
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

    testServerRoute(
        server,
        '/api/admin/client-metrics/features/myFlag/raw',
        [],
    );

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
                technicalDebt: 0,
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
    render(
        <WelcomeDialogProvider>
            <PersonalDashboard />
        </WelcomeDialogProvider>,
    );

    await screen.findByText('Welcome Unleash User');
    await screen.findByText('projectName');
    await screen.findByText('10'); // members
    await screen.findByText('100'); // features
    await screen.findAllByText('20%'); // technical debt

    await screen.findByText('Technical debt');
    await screen.findByText('30%'); // avg technical debt past window
    await screen.findByText('someone created a flag');
    await screen.findByText('Member');
    await screen.findByText('myFlag');
    await screen.findByText('production');
    await screen.findByText('Last 48 hours');
});

test('Render personal dashboard for a new project', async () => {
    setupNewProject();
    render(
        <WelcomeDialogProvider>
            <PersonalDashboard />
        </WelcomeDialogProvider>,
    );

    await screen.findByText('Welcome Unleash User');
    await screen.findByText('projectName');
    await screen.findByText('3'); // members
    await screen.findByText('0'); // features
    await screen.findByText('0%'); // technical debt

    await screen.findByText('Create a feature flag');
    await screen.findByText('Connect an SDK');
    await screen.findByText('You have no project roles in this project.');
    await screen.findByText(
        'You have not created or favorited any feature flags. Once you do, they will show up here.',
    );
});
