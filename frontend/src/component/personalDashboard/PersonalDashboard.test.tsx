import { expect, test } from 'vitest';
import { PersonalDashboard } from './PersonalDashboard.tsx';
import { render } from 'utils/testRenderer';
import { screen, within } from '@testing-library/react';
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

test('lists my projects in the order the projects page shows when sorted by last updated', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { dashboardV2: true },
    });
    testServerRoute(server, '/api/admin/user', {
        user: { name: 'Unleash User' },
    });
    testServerRoute(server, '/api/admin/user/profile', {
        projects: ['member-b', 'member-a'],
    });
    testServerRoute(server, '/api/admin/personal-dashboard', {
        flags: [],
    });
    testServerRoute(server, '/api/admin/projects', {
        projects: [
            {
                id: 'member-a',
                name: 'member-a',
                createdAt: '2024-01-01T00:00:00.000Z',
            },
            { id: 'not-mine', name: 'not-mine' },
            {
                id: 'member-b',
                name: 'member-b',
                createdAt: '2023-01-01T00:00:00.000Z',
                lastUpdatedAt: '2024-06-01T00:00:00.000Z',
            },
            { id: 'favorite', name: 'zz-favorite', favorite: true },
        ],
    });

    render(
        <WelcomeDialogProvider>
            <PersonalDashboard />
        </WelcomeDialogProvider>,
    );

    const panel = await screen.findByRole('region', { name: 'My projects' });
    await within(panel).findByRole('link', { name: /zz-favorite/ });
    const cardLinks = within(panel)
        .getAllByRole('link')
        .map((link) => link.getAttribute('href'))
        .filter((href) => href?.startsWith('/projects/'));
    expect(cardLinks).toEqual([
        '/projects/favorite',
        '/projects/member-b',
        '/projects/member-a',
    ]);
});

const renderRecentFlagsPanel = () => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { dashboardV2: true },
    });

    render(
        <WelcomeDialogProvider>
            <PersonalDashboard />
        </WelcomeDialogProvider>,
    );

    return screen.findByRole('region', { name: 'Recent feature flags' });
};

test('lists the flags I recently worked on', async () => {
    testServerRoute(server, '/api/admin/user/recent-flags', {
        flags: [{ name: 'recent-flag', project: 'projectId' }],
    });

    const panel = await renderRecentFlagsPanel();

    const flagLink = await within(panel).findByRole('link', {
        name: 'recent-flag',
    });
    expect(flagLink.getAttribute('href')).toBe(
        '/projects/projectId/features/recent-flag',
    );
});

test('hides the link to all flags when I have not worked on any flags', async () => {
    testServerRoute(server, '/api/admin/user/recent-flags', { flags: [] });

    const panel = await renderRecentFlagsPanel();

    await within(panel).findByText('You don’t have any flags here yet.');
    expect(
        within(panel).queryByRole('link', { name: 'View all flags' }),
    ).not.toBeInTheDocument();
});

test('keeps the link to all flags when recent flags fail to load', async () => {
    testServerRoute(server, '/api/admin/user/recent-flags', {}, 'get', 500);

    const panel = await renderRecentFlagsPanel();

    await within(panel).findByText("We couldn't load your feature flags.");
    expect(
        within(panel).getByRole('link', { name: 'View all flags' }),
    ).toBeInTheDocument();
});
