import '@testing-library/jest-dom/vitest';
import { beforeEach, expect, test, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import copy from 'copy-to-clipboard';
import { http, HttpResponse } from 'msw';
import { render, settleProviders } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import {
    ADMIN,
    CREATE_FEATURE,
} from 'component/providers/AccessProvider/permissions';
import { DashboardOnboarding } from './DashboardOnboarding.tsx';
import { PersonalDashboard } from './PersonalDashboard.tsx';
import { WelcomeDialogProvider } from './WelcomeDialogProvider.tsx';

vi.mock('copy-to-clipboard', () => ({ default: vi.fn(() => true) }));
vi.mock('./FlagMetricsChart.tsx', () => ({
    FlagMetricsChart: () => null,
    PlaceholderFlagMetricsChartWithWrapper: () => null,
}));

const server = testServerSetup();
const config = {
    flags: { dashboardV2: true, dashboardV2Widgets: true },
    versionInfo: { current: { enterprise: '8.3.1', oss: '8.3.1' } },
};
const flag = { name: 'my-flag', project: 'default', environments: [] };

beforeEach(() => {
    vi.clearAllMocks();
    testServerRoute(server, '/api/admin/ui-config', config);
    testServerRoute(server, '/api/admin/user', {
        user: { id: 1, name: 'Test User' },
        permissions: [{ permission: CREATE_FEATURE, project: 'default' }],
        splash: {},
    });
    testServerRoute(server, '/api/admin/projects', {
        projects: [{ id: 'default', name: 'Default' }],
    });
    testServerRoute(server, '/api/admin/user/recent-flags', { flags: [] });
    testServerRoute(server, '/api/admin/personal-dashboard', {
        projects: [],
        flags: [],
    });
    testServerRoute(server, '/api/admin/user/profile', { projects: [] });
});

test.each([
    { flags: [] },
    { flags: [flag] },
    {
        flags: [
            { ...flag, environments: [{ name: 'development', yes: 0, no: 0 }] },
        ],
    },
])('offers setup and resources when personal flags have no evaluations (%j)', async ({
    flags,
}) => {
    testServerRoute(server, '/api/admin/user/recent-flags', { flags });
    render(<DashboardOnboarding />);

    expect(
        await screen.findByRole('region', {
            name: 'Create and connect your first flag',
        }),
    ).toBeInTheDocument();
    expect(
        screen.getByRole('region', { name: 'Need help?' }),
    ).toBeInTheDocument();
    expect(
        screen.getByRole('link', { name: 'Import from OSS' }),
    ).toHaveAttribute(
        'href',
        'https://docs.getunleash.io/guides/migrate-from-open-source',
    );
    expect(
        screen.getByRole('link', { name: 'Create your first flag' }),
    ).toHaveAttribute('href', '/projects/default?create=true');
});

test.each([
    { lastSeenAt: '2025-01-01T00:00:00Z' },
    { yes: 1 },
    { no: 1 },
])('hides setup for evaluation evidence in any environment (%j)', async (evidence) => {
    testServerRoute(server, '/api/admin/user/recent-flags', {
        flags: [
            { ...flag, environments: [{ name: 'production', ...evidence }] },
        ],
    });
    render(<DashboardOnboarding />);
    await settleProviders();

    expect(screen.queryByRole('region')).not.toBeInTheDocument();
});

test.each([
    ADMIN,
    CREATE_FEATURE,
])('offers flag creation to users with %s', async (permission) => {
    testServerRoute(server, '/api/admin/user', {
        user: { id: 1 },
        permissions: [{ permission }],
        splash: {},
    });
    testServerRoute(server, '/api/admin/remote-mcp/settings', {
        enabled: false,
    });
    render(<DashboardOnboarding />);

    expect(
        await screen.findByRole('link', { name: 'Create your first flag' }),
    ).toHaveAttribute('href', '/projects/default?create=true');
});

test('chooses the first writable project when default is not writable', async () => {
    testServerRoute(server, '/api/admin/projects', {
        projects: [{ id: 'default' }, { id: 'my project' }, { id: 'other' }],
    });
    testServerRoute(server, '/api/admin/user', {
        user: { id: 1 },
        permissions: [{ permission: CREATE_FEATURE, project: 'my project' }],
        splash: {},
    });
    render(<DashboardOnboarding />);

    expect(
        await screen.findByRole('link', { name: 'Create your first flag' }),
    ).toHaveAttribute('href', '/projects/my%20project?create=true');
});

test('prefers a writable default project even if it is not first', async () => {
    testServerRoute(server, '/api/admin/projects', {
        projects: [{ id: 'other' }, { id: 'default' }],
    });
    testServerRoute(server, '/api/admin/user', {
        user: { id: 1 },
        permissions: [{ permission: CREATE_FEATURE }],
        splash: {},
    });
    render(<DashboardOnboarding />);

    expect(
        await screen.findByRole('link', { name: 'Create your first flag' }),
    ).toHaveAttribute('href', '/projects/default?create=true');
});

test('offers only the newcomer banner for empty flags without create permission', async () => {
    testServerRoute(server, '/api/admin/user', {
        user: { id: 1 },
        permissions: [],
        splash: {},
    });
    render(<DashboardOnboarding />);

    expect(
        await screen.findByRole('region', { name: 'New to Unleash?' }),
    ).toBeInTheDocument();
    expect(
        screen.queryByRole('region', { name: 'Need help?' }),
    ).not.toBeInTheDocument();
    expect(
        screen.queryByText('Create and connect your first flag'),
    ).not.toBeInTheDocument();
});

test('shows no onboarding for a user without create permission who already has flags', async () => {
    testServerRoute(server, '/api/admin/user', {
        user: { id: 1 },
        permissions: [],
        splash: {},
    });
    testServerRoute(server, '/api/admin/user/recent-flags', { flags: [flag] });
    render(<DashboardOnboarding />);
    await settleProviders();

    expect(screen.queryByRole('region')).not.toBeInTheDocument();
});

test.each([
    '/api/admin/projects',
    '/api/admin/user/recent-flags',
    '/api/admin/user',
    '/api/admin/ui-config',
])('does not infer onboarding from failed data at %s', async (path) => {
    testServerRoute(server, path, {}, 'get', 500);
    render(
        <DashboardOnboarding>
            <div>Normal dashboard</div>
        </DashboardOnboarding>,
    );
    await screen.findByText('Normal dashboard');

    expect(screen.queryByRole('region')).not.toBeInTheDocument();
});

test('does not interpret missing permissions as denied permission', async () => {
    testServerRoute(server, '/api/admin/user', { user: { id: 1 }, splash: {} });
    render(<DashboardOnboarding />);
    await settleProviders();

    expect(screen.queryByRole('region')).not.toBeInTheDocument();
});

test.each([
    ['/api/admin/projects', { projects: [{ id: 'default' }] }],
    ['/api/admin/user/recent-flags', { flags: [] }],
    [
        '/api/admin/user',
        {
            user: { id: 1 },
            permissions: [{ permission: CREATE_FEATURE, project: 'default' }],
            splash: {},
        },
    ],
])('does not flash normal dashboard content while loading %s', async (path, response) => {
    let finishLoading: () => void = () => {};
    const loading = new Promise<void>((resolve) => {
        finishLoading = resolve;
    });
    server.use(
        http.get(path, async () => {
            await loading;
            return HttpResponse.json(response);
        }),
    );
    render(
        <DashboardOnboarding>
            <div>Normal dashboard</div>
        </DashboardOnboarding>,
    );
    await settleProviders();

    try {
        expect(screen.queryByText('Normal dashboard')).not.toBeInTheDocument();
        expect(screen.queryByRole('region')).not.toBeInTheDocument();
    } finally {
        finishLoading();
    }
    expect(
        await screen.findByRole('region', {
            name: 'Create and connect your first flag',
        }),
    ).toBeInTheDocument();
});

test('does not flash dashboard panels before widget flags have loaded', async () => {
    let finishLoading: () => void = () => {};
    const loading = new Promise<void>((resolve) => {
        finishLoading = resolve;
    });
    server.use(
        http.get('/api/admin/ui-config', async () => {
            await loading;
            return HttpResponse.json(config);
        }),
    );
    render(
        <WelcomeDialogProvider>
            <PersonalDashboard />
        </WelcomeDialogProvider>,
    );
    await settleProviders();

    try {
        expect(screen.queryByText('Event timeline')).not.toBeInTheDocument();
    } finally {
        finishLoading();
    }
    expect(
        await screen.findByRole('region', {
            name: 'Create and connect your first flag',
        }),
    ).toBeInTheDocument();
});

test('offers Enterprise on OSS instead of importing', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: config.flags,
        versionInfo: { current: { oss: '8.3.1' } },
    });
    render(<DashboardOnboarding />);

    expect(
        await screen.findByText('Try Unleash Enterprise'),
    ).toBeInTheDocument();
    expect(
        screen.queryByRole('link', { name: 'Import from OSS' }),
    ).not.toBeInTheDocument();
});

test('copies real instance context including its base path', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        ...config,
        baseUriPath: '/unleash',
        flags: { ...config.flags, dashboardOnboardingAI: true },
    });
    render(<DashboardOnboarding />);

    await userEvent.click(
        await screen.findByRole('button', { name: 'Copy setup prompt' }),
    );
    expect(vi.mocked(copy).mock.calls[0][0]).toContain(
        `My Unleash instance is: ${window.location.origin}/unleash`,
    );
    expect(vi.mocked(copy).mock.calls[0][0]).toContain(
        'Create flags in this project: yes',
    );
    expect(
        screen.getByRole('link', { name: 'Create flag manually' }),
    ).toHaveAttribute('href', '/projects/default?create=true');
});

test.each([
    { dashboardV2: false, dashboardV2Widgets: true },
    { dashboardV2: true, dashboardV2Widgets: false },
])('keeps onboarding off unless both dashboard flags are enabled (%j)', async (flags) => {
    testServerRoute(server, '/api/admin/ui-config', { ...config, flags });
    render(
        <WelcomeDialogProvider>
            <PersonalDashboard />
        </WelcomeDialogProvider>,
    );
    await screen.findByText('Welcome Test User');
    await settleProviders();

    expect(
        screen.queryByRole('region', {
            name: 'Create and connect your first flag',
        }),
    ).not.toBeInTheDocument();
});

test('replaces normal dashboard content with setup widgets', async () => {
    render(
        <WelcomeDialogProvider>
            <PersonalDashboard />
        </WelcomeDialogProvider>,
    );

    expect(
        await screen.findByRole('region', {
            name: 'Create and connect your first flag',
        }),
    ).toBeInTheDocument();
    expect(
        screen.queryByRole('region', { name: 'My projects' }),
    ).not.toBeInTheDocument();
    expect(
        screen.queryByRole('region', { name: 'Recent feature flags' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Event timeline')).not.toBeInTheDocument();
});

test.each([
    {
        view: 'newcomer',
        permissions: [],
        flags: [],
        newcomerBanners: 1,
    },
    {
        view: 'configured',
        permissions: [{ permission: CREATE_FEATURE, project: 'default' }],
        flags: [{ ...flag, environments: [{ name: 'development', no: 1 }] }],
        newcomerBanners: 0,
    },
])('retains normal dashboard content for the $view view', async ({
    permissions,
    flags,
    newcomerBanners,
}) => {
    testServerRoute(server, '/api/admin/user', {
        user: { id: 1 },
        permissions,
        splash: {},
    });
    testServerRoute(server, '/api/admin/user/recent-flags', { flags });
    render(
        <WelcomeDialogProvider>
            <PersonalDashboard />
        </WelcomeDialogProvider>,
    );
    await settleProviders();
    expect(
        screen.getByRole('region', { name: 'My projects' }),
    ).toBeInTheDocument();
    expect(
        screen.getByRole('region', { name: 'Recent feature flags' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Event timeline')).toBeInTheDocument();
    expect(
        screen.queryByRole('region', {
            name: 'Create and connect your first flag',
        }),
    ).not.toBeInTheDocument();
    expect(
        screen.queryAllByRole('region', { name: 'New to Unleash?' }),
    ).toHaveLength(newcomerBanners);
});

test('replaces the old OSS upsell when onboarding widgets are enabled', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: config.flags,
        versionInfo: { current: { oss: '8.3.1' } },
    });
    render(
        <WelcomeDialogProvider>
            <PersonalDashboard />
        </WelcomeDialogProvider>,
    );

    expect(
        await screen.findByText('Try Unleash Enterprise'),
    ).toBeInTheDocument();
    expect(
        screen.queryByText('Explore our Enterprise solution'),
    ).not.toBeInTheDocument();
});

test('retains the old OSS upsell when onboarding widgets are disabled', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { dashboardV2: true, dashboardV2Widgets: false },
        versionInfo: { current: { oss: '8.3.1' } },
    });
    render(
        <WelcomeDialogProvider>
            <PersonalDashboard />
        </WelcomeDialogProvider>,
    );

    expect(
        await screen.findByText('Explore our Enterprise solution'),
    ).toBeInTheDocument();
    expect(
        screen.queryByText('Try Unleash Enterprise'),
    ).not.toBeInTheDocument();
});

test.each([
    ['enabled', { enabled: true }, 200],
    ['disabled', { enabled: false }, 200],
    ['unknown', {}, 500],
])('includes %s remote MCP status for an Enterprise administrator', async (status, response, code) => {
    testServerRoute(server, '/api/admin/user', {
        user: { id: 1 },
        permissions: [{ permission: ADMIN }],
        splash: {},
    });
    testServerRoute(server, '/api/admin/ui-config', {
        ...config,
        flags: { ...config.flags, dashboardOnboardingAI: true },
    });
    testServerRoute(
        server,
        '/api/admin/remote-mcp/settings',
        response,
        'get',
        code,
    );
    render(<DashboardOnboarding />);
    await screen.findByRole('button', { name: 'Copy setup prompt' });
    await settleProviders();
    await userEvent.click(
        screen.getByRole('button', { name: 'Copy setup prompt' }),
    );

    expect(vi.mocked(copy).mock.calls[0][0]).toContain(
        `Remote MCP: ${status}.`,
    );
});

test.each([
    false,
    { enabled: false, name: 'disabled' },
])('skips remote MCP settings for manual-only setup (%j)', async (aiSetup) => {
    testServerRoute(server, '/api/admin/user', {
        user: { id: 1 },
        permissions: [{ permission: ADMIN }],
        splash: {},
    });
    testServerRoute(server, '/api/admin/ui-config', {
        ...config,
        flags: { ...config.flags, dashboardOnboardingAI: aiSetup },
    });
    const requests: string[] = [];
    server.use(
        http.get('/api/admin/remote-mcp/settings', ({ request }) => {
            requests.push(request.url);
            return HttpResponse.json({ enabled: true });
        }),
    );
    render(<DashboardOnboarding />);
    await screen.findByRole('link', { name: 'Create your first flag' });
    await settleProviders();

    expect(
        screen.queryByRole('button', { name: 'Copy setup prompt' }),
    ).not.toBeInTheDocument();
    expect(requests).toEqual([]);
});
