import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { backdropClasses } from '@mui/material/Backdrop';
import { Link } from 'react-router';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { resizeScreen } from 'utils/resizeScreen';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { ADMIN } from 'component/providers/AccessProvider/permissions.ts';
import {
    CHECKLIST_ELIGIBLE_SPLASH,
    mockChecklistProjectOnboardingStarted,
    mockUserWithSplash,
} from 'component/onboarding/floatingChecklist/onboardingChecklistTestServer.ts';
import { mockPendingAccessRequest } from 'component/admin/users/AccessRequestsNotifications/accessRequestsTestServer.ts';
import { AppShell } from './AppShell.tsx';

vi.mock('component/menu/Header/SearchDocs/SearchDocs.tsx', () => ({
    SearchDocsChat: ({
        open,
        onOpenChange,
    }: {
        open: boolean;
        onOpenChange: (open: boolean) => void;
    }) =>
        open ? (
            <div>
                Docs chat
                <button type='button' onClick={() => onOpenChange(false)}>
                    Close docs chat
                </button>
            </div>
        ) : null,
}));

const server = testServerSetup();
const SMALL_SCREEN = 600;
const DESKTOP = 1280;

afterEach(() => {
    vi.useRealTimers();
});

beforeEach(() => {
    localStorage.clear();
    resizeScreen(DESKTOP);
});

// Before ui-config loads isEnterprise() is already false, so asserting an
// absent link is only meaningful once the config is known to be loaded.
const UiConfigLoaded = () => {
    const { loading } = useUiConfig();
    return loading ? null : 'ui config loaded';
};

const mockEnterprise = () =>
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: { current: { enterprise: 'version' } },
        environment: 'Enterprise',
    });

test('links Home to the personal dashboard', () => {
    render(<AppShell>content</AppShell>);

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
        'href',
        '/personal',
    );
});

test('links Projects and Flags overview in the Workspace section', () => {
    render(<AppShell>content</AppShell>);

    const workspace = within(screen.getByRole('region', { name: 'Workspace' }));
    expect(workspace.getByRole('link', { name: 'Projects' })).toHaveAttribute(
        'href',
        '/projects',
    );
    expect(
        workspace.getByRole('link', { name: 'Flags overview' }),
    ).toHaveAttribute('href', '/search');
});

test('reveals Playground, Analytics and Impact views under More', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: { current: { enterprise: 'version' } },
        flags: { impactViews: true },
    });

    render(
        <AppShell>
            <UiConfigLoaded />
        </AppShell>,
    );

    await screen.findByText('ui config loaded');
    const workspace = within(screen.getByRole('region', { name: 'Workspace' }));
    expect(
        workspace.queryByRole('link', { name: 'Playground' }),
    ).not.toBeInTheDocument();

    await userEvent.click(workspace.getByRole('button', { name: 'More' }));

    expect(workspace.getByRole('link', { name: 'Playground' })).toHaveAttribute(
        'href',
        '/playground',
    );
    expect(workspace.getByRole('link', { name: 'Analytics' })).toHaveAttribute(
        'href',
        '/insights',
    );
    expect(
        workspace.getByRole('link', { name: 'Impact views' }),
    ).toHaveAttribute('href', '/impact-views');
});

test('hides the More items again with Less', async () => {
    render(<AppShell>content</AppShell>);
    await userEvent.click(screen.getByRole('button', { name: 'More' }));

    await userEvent.click(screen.getByRole('button', { name: 'Less' }));

    expect(
        screen.queryByRole('link', { name: 'Playground' }),
    ).not.toBeInTheDocument();
});

test('keeps More open after the sidebar remounts', async () => {
    const { unmount } = render(<AppShell>content</AppShell>);
    await userEvent.click(screen.getByRole('button', { name: 'More' }));
    unmount();

    render(<AppShell>content</AppShell>);

    expect(screen.getByRole('button', { name: 'Less' })).toHaveAttribute(
        'aria-expanded',
        'true',
    );
    expect(
        screen.getByRole('link', { name: 'Playground' }),
    ).toBeInTheDocument();
});

test('shows only Playground under More on oss', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: { current: { oss: 'version' } },
        flags: { impactViews: true },
    });

    render(
        <AppShell>
            <UiConfigLoaded />
        </AppShell>,
    );

    await screen.findByText('ui config loaded');
    const workspace = within(screen.getByRole('region', { name: 'Workspace' }));
    await userEvent.click(workspace.getByRole('button', { name: 'More' }));

    expect(
        workspace.getByRole('link', { name: 'Playground' }),
    ).toBeInTheDocument();
    expect(
        workspace.queryByRole('link', { name: 'Analytics' }),
    ).not.toBeInTheDocument();
    expect(
        workspace.queryByRole('link', { name: 'Impact views' }),
    ).not.toBeInTheDocument();
});

test('marks the link of the current page as current', () => {
    render(<AppShell>content</AppShell>, { route: '/search' });

    expect(
        screen.getByRole('link', { name: 'Flags overview' }),
    ).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute(
        'aria-current',
    );
});

test('marks a link as current on its nested pages', () => {
    render(<AppShell>content</AppShell>, { route: '/personal/some-tab' });

    const sidebar = within(screen.getByRole('navigation', { name: 'Main' }));
    expect(sidebar.getByRole('link', { name: 'Home' })).toHaveAttribute(
        'aria-current',
        'page',
    );
});

test('does not mark Projects as current inside a project', () => {
    render(<AppShell>content</AppShell>, { route: '/projects/default' });

    expect(screen.getByRole('link', { name: 'Projects' })).not.toHaveAttribute(
        'aria-current',
    );
});

test('shows change requests on enterprise', async () => {
    mockEnterprise();

    render(<AppShell>content</AppShell>);

    expect(
        await screen.findByRole('link', { name: 'Change requests' }),
    ).toHaveAttribute('href', '/change-requests');
});

test('hides change requests on oss', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: { current: { oss: 'version' } },
    });

    render(
        <AppShell>
            <UiConfigLoaded />
        </AppShell>,
    );

    await screen.findByText('ui config loaded');
    expect(
        screen.queryByRole('link', { name: 'Change requests' }),
    ).not.toBeInTheDocument();
});

const openConfigureWorkspace = async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));
    await userEvent.click(
        screen.getByRole('menuitem', { name: 'Configure workspace' }),
    );
};

test('replaces the app navigation with the workspace configuration', async () => {
    render(<AppShell>content</AppShell>);

    await openConfigureWorkspace();

    expect(
        screen.getByRole('region', { name: 'Configure workspace' }),
    ).toBeInTheDocument();
    expect(
        screen.queryByRole('link', { name: 'Unleash' }),
    ).not.toBeInTheDocument();
    expect(
        screen.queryByRole('link', { name: 'Home' }),
    ).not.toBeInTheDocument();
    expect(
        screen.queryByRole('region', { name: 'Workspace' }),
    ).not.toBeInTheDocument();
});

test('returns to the app navigation with Back to app', async () => {
    render(<AppShell>content</AppShell>);
    await openConfigureWorkspace();

    await userEvent.click(screen.getByRole('button', { name: 'Back to app' }));

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(
        screen.queryByRole('region', { name: 'Configure workspace' }),
    ).not.toBeInTheDocument();
});

test('opens the workspace configuration when landing on a workspace page', () => {
    render(<AppShell>content</AppShell>, { route: '/context/create' });

    expect(
        screen.getByRole('region', { name: 'Configure workspace' }),
    ).toBeInTheDocument();
    expect(
        screen.queryByRole('link', { name: 'Home' }),
    ).not.toBeInTheDocument();
});

test('lets Back to app leave the workspace configuration on a workspace page', async () => {
    render(<AppShell>content</AppShell>, { route: '/context' });

    await userEvent.click(screen.getByRole('button', { name: 'Back to app' }));

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
});

test('keeps the workspace configuration open when following its links', async () => {
    render(<AppShell>content</AppShell>, { route: '/projects' });
    await openConfigureWorkspace();

    await userEvent.click(screen.getByRole('link', { name: 'Context fields' }));

    expect(
        screen.getByRole('region', { name: 'Configure workspace' }),
    ).toBeInTheDocument();
});

test('returns to the app navigation when leaving the page it was opened on', async () => {
    render(
        <AppShell>
            <Link to='/search'>Go to search</Link>
        </AppShell>,
        { route: '/projects' },
    );
    await openConfigureWorkspace();

    await userEvent.click(screen.getByRole('link', { name: 'Go to search' }));

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
});

test('does not reopen the workspace configuration when coming back to the page it was opened on', async () => {
    render(
        <AppShell>
            <Link to='/search'>Go to search</Link>
        </AppShell>,
        { route: '/projects' },
    );
    await openConfigureWorkspace();
    await userEvent.click(screen.getByRole('link', { name: 'Go to search' }));

    await userEvent.click(screen.getByRole('link', { name: 'Projects' }));

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
});

test('keeps the app navigation on a workspace page when only the query string changes', async () => {
    render(
        <AppShell>
            <Link to='/applications?sortOrder=asc'>Sort by name</Link>
        </AppShell>,
        { route: '/applications' },
    );
    await userEvent.click(screen.getByRole('button', { name: 'Back to app' }));

    await userEvent.click(screen.getByRole('link', { name: 'Sort by name' }));

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
});

test('links every workspace setting on enterprise', async () => {
    mockEnterprise();
    render(<AppShell>content</AppShell>);
    await openConfigureWorkspace();

    const configureWorkspace = within(
        screen.getByRole('region', { name: 'Configure workspace' }),
    );
    await configureWorkspace.findByRole('link', { name: 'Environments' });

    expect(
        configureWorkspace
            .getAllByRole('link')
            .map((link) => [link.textContent, link.getAttribute('href')]),
    ).toEqual([
        ['Applications', '/applications'],
        ['Context fields', '/context'],
        ['Feature flag types', '/feature-toggle-type'],
        ['Strategy types', '/strategies'],
        ['Environments', '/environments'],
        ['Release templates', '/release-templates'],
        ['Tag types', '/tag-types'],
        ['Integrations', '/integrations'],
        ['Segments', '/segments'],
    ]);
});

const openAdminSettings = async () => {
    await userEvent.click(screen.getByRole('button', { name: /^Settings/ }));
    await userEvent.click(
        screen.getByRole('menuitem', { name: /^Admin settings/ }),
    );
};

test('replaces the app navigation with admin settings', async () => {
    render(<AppShell>content</AppShell>);

    await openAdminSettings();

    expect(
        screen.getByRole('region', { name: 'Admin settings' }),
    ).toBeInTheDocument();
    expect(
        screen.queryByRole('link', { name: 'Unleash' }),
    ).not.toBeInTheDocument();
    expect(
        screen.queryByRole('link', { name: 'Home' }),
    ).not.toBeInTheDocument();
    expect(
        screen.queryByRole('region', { name: 'Workspace' }),
    ).not.toBeInTheDocument();
});

test('returns from admin settings to the app navigation with Back to app', async () => {
    render(<AppShell>content</AppShell>);
    await openAdminSettings();

    await userEvent.click(screen.getByRole('button', { name: 'Back to app' }));

    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(
        screen.queryByRole('region', { name: 'Admin settings' }),
    ).not.toBeInTheDocument();
});

test('switches from the workspace configuration to admin settings', async () => {
    render(<AppShell>content</AppShell>);
    await openConfigureWorkspace();

    await openAdminSettings();

    expect(
        screen.getByRole('region', { name: 'Admin settings' }),
    ).toBeInTheDocument();
    expect(
        screen.queryByRole('region', { name: 'Configure workspace' }),
    ).not.toBeInTheDocument();
});

test.each([
    'Configure workspace',
    'Admin settings',
])('moves focus to Back to app after choosing %s with the keyboard', async (item) => {
    render(<AppShell>content</AppShell>);
    screen.getByRole('button', { name: 'Settings' }).focus();
    await userEvent.keyboard('{Enter}');
    await screen.findByRole('menu', { name: 'Settings' });

    screen.getByRole('menuitem', { name: item }).focus();
    await userEvent.keyboard('{Enter}');

    expect(screen.getByRole('button', { name: 'Back to app' })).toHaveFocus();
});

test('moves focus to the start of the app navigation with Back to app', async () => {
    render(<AppShell>content</AppShell>, { route: '/context' });
    screen.getByRole('button', { name: 'Back to app' }).focus();

    await userEvent.keyboard('{Enter}');

    expect(screen.getByRole('link', { name: 'Unleash' })).toHaveFocus();
});

test('leaves focus alone when the page loads', () => {
    render(<AppShell>content</AppShell>, { route: '/context' });

    expect(document.body).toHaveFocus();
});

test('does not move focus when navigation changes the sidebar', async () => {
    render(
        <AppShell>
            <Link to='/context'>Go to context</Link>
        </AppShell>,
    );
    const link = screen.getByRole('link', { name: 'Go to context' });
    link.focus();

    await userEvent.keyboard('{Enter}');

    expect(
        screen.getByRole('region', { name: 'Configure workspace' }),
    ).toBeInTheDocument();
    expect(link).toHaveFocus();
});

test.each([
    ['/admin/users/1/edit', 'Users'],
    ['/history', 'Event log'],
])('opens admin settings when landing on %s', async (route, currentPage) => {
    render(<AppShell>content</AppShell>, { route });

    const adminSettings = within(
        screen.getByRole('region', { name: 'Admin settings' }),
    );
    expect(
        screen.queryByRole('link', { name: 'Home' }),
    ).not.toBeInTheDocument();
    expect(
        await adminSettings.findByRole('link', { name: currentPage }),
    ).toHaveAttribute('aria-current', 'page');
});

test('opens admin settings when landing on an admin page outside the menu', () => {
    render(<AppShell>content</AppShell>, { route: '/admin' });

    expect(
        screen.getByRole('region', { name: 'Admin settings' }),
    ).toBeInTheDocument();
});

test('links every admin setting on enterprise', async () => {
    mockEnterprise();
    render(<AppShell>content</AppShell>);
    await openAdminSettings();

    const adminSettings = within(
        screen.getByRole('region', { name: 'Admin settings' }),
    );
    await adminSettings.findByRole('link', { name: 'Remote MCP server' });

    expect(
        adminSettings
            .getAllByRole('button')
            .map((button) => button.textContent),
    ).toEqual([
        'User config',
        'Access control',
        'Single sign-on',
        'Network',
        'Instance config',
    ]);
    expect(
        adminSettings
            .getAllByRole('link')
            .map((link) => [link.textContent, link.getAttribute('href')]),
    ).toEqual([
        ['Service accounts', '/admin/service-accounts'],
        ['Enterprise Edge', '/admin/enterprise-edge'],
        ['Remote MCP server', '/admin/remote-mcp'],
        ['Impact Metrics', '/admin/impact-metrics'],
        ['Event log', '/history'],
    ]);
});

test('highlights the current admin page and its group', async () => {
    mockEnterprise();
    render(<AppShell>content</AppShell>, {
        route: '/admin/roles/project-roles',
    });

    const userConfig = within(
        await screen.findByRole('group', { name: 'User config' }),
    );

    expect(screen.getByRole('button', { name: 'User config' })).toHaveAttribute(
        'aria-current',
        'location',
    );
    expect(
        userConfig.getByRole('link', { name: 'Project roles' }),
    ).toHaveAttribute('aria-current', 'page');
    expect(
        userConfig.getByRole('link', { name: 'Root roles' }),
    ).not.toHaveAttribute('aria-current');
    expect(
        screen.queryByRole('group', { name: 'Access control' }),
    ).not.toBeInTheDocument();
});

test('toggles an admin group', async () => {
    render(<AppShell>content</AppShell>);
    await openAdminSettings();
    const toggle = screen.getByRole('button', { name: 'Access control' });

    await userEvent.click(toggle);

    expect(
        within(screen.getByRole('group', { name: 'Access control' })).getByRole(
            'link',
            { name: 'API access' },
        ),
    ).toHaveAttribute('href', '/admin/api');

    await userEvent.click(toggle);

    expect(
        screen.queryByRole('group', { name: 'Access control' }),
    ).not.toBeInTheDocument();
});

test('moves the pending access requests dot from User config to Users when the group expands', async () => {
    mockEnterprise();
    mockPendingAccessRequest(server);
    render(<AppShell>content</AppShell>, {
        permissions: [{ permission: ADMIN }],
    });
    await openAdminSettings();
    const toggle = screen.getByRole('button', { name: /User config/ });

    expect(
        await within(toggle).findByLabelText('Pending access requests'),
    ).toBeInTheDocument();

    await userEvent.click(toggle);

    expect(
        within(toggle).queryByLabelText('Pending access requests'),
    ).not.toBeInTheDocument();
    expect(
        within(screen.getByRole('link', { name: /^Users/ })).getByLabelText(
            'Pending access requests',
        ),
    ).toBeInTheDocument();
    expect(
        within(
            screen.getByRole('link', { name: 'Root roles' }),
        ).queryByLabelText('Pending access requests'),
    ).not.toBeInTheDocument();
});

const renderForOnboardingAdmin = () => {
    mockUserWithSplash(server, CHECKLIST_ELIGIBLE_SPLASH);
    mockChecklistProjectOnboardingStarted(server);

    render(<AppShell>content</AppShell>, {
        permissions: [{ permission: ADMIN }],
    });
};

test('opens the help menu with Get started from Help & resources', async () => {
    renderForOnboardingAdmin();
    const button = screen.getByRole('button', { name: 'Help & resources' });

    await userEvent.click(button);

    expect(
        await screen.findByRole('menuitem', { name: /Get started/ }),
    ).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-expanded', 'true');
});

test('points to Help & resources after closing the Get started checklist', async () => {
    renderForOnboardingAdmin();
    const checklist = await screen.findByLabelText('Get started');

    await userEvent.click(
        within(checklist).getByRole('button', { name: 'Close' }),
    );

    expect(
        await screen.findByText(
            'You can reopen the Get started checklist from here anytime',
        ),
    ).toBeInTheDocument();
});

test('shows the command bar shortcut on the Search button', () => {
    render(<AppShell>content</AppShell>);

    expect(screen.getByRole('button', { name: /^Search/ })).toHaveTextContent(
        'Ctrl+K',
    );
});

test('opens the command bar from the Search button with keyboard hints', async () => {
    render(<AppShell>content</AppShell>);
    const searchButton = screen.getByRole('button', { name: /^Search/ });

    await userEvent.click(searchButton);

    const commandBar = within(
        await screen.findByRole('dialog', { name: /command menu/i }),
    );
    expect(commandBar.getByRole('textbox')).toHaveFocus();
    expect(commandBar.getByText('to navigate')).toBeVisible();
    expect(searchButton).toHaveAttribute('aria-expanded', 'true');
    expect(searchButton).toHaveAttribute('aria-haspopup', 'dialog');
});

test('returns focus to the Search button when the command bar closes', async () => {
    render(<AppShell>content</AppShell>);
    const searchButton = screen.getByRole('button', { name: /^Search/ });
    await userEvent.click(searchButton);
    await screen.findByRole('dialog');

    await userEvent.keyboard('{Escape}');

    await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(searchButton).toHaveFocus();
    expect(searchButton).toHaveAttribute('aria-expanded', 'false');
});

test('toggles the command bar with Ctrl+K in Configure workspace mode, which has no Search button', async () => {
    render(<AppShell>content</AppShell>, { route: '/context' });

    await userEvent.keyboard('{Control>}k{/Control}');
    expect(await screen.findByRole('dialog')).toBeVisible();

    await userEvent.keyboard('{Control>}k{/Control}');
    await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
});

const withSearchDocsWidget = () =>
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { searchDocsWidget: true },
    });

const openSearchDocsFromHelpMenu = async () => {
    await userEvent.click(
        screen.getByRole('button', { name: 'Help & resources' }),
    );
    await userEvent.click(
        await screen.findByRole('menuitem', { name: 'Search docs' }),
    );
};

test('opens the docs chat from Search docs in Help & resources', async () => {
    withSearchDocsWidget();
    render(<AppShell>content</AppShell>);

    await openSearchDocsFromHelpMenu();

    expect(await screen.findByText('Docs chat')).toBeInTheDocument();
});

test('reopens the docs chat from Help & resources after the chat was closed', async () => {
    withSearchDocsWidget();
    render(<AppShell>content</AppShell>);
    await openSearchDocsFromHelpMenu();
    await userEvent.click(
        await screen.findByRole('button', { name: 'Close docs chat' }),
    );
    await waitFor(() =>
        expect(screen.queryByText('Docs chat')).not.toBeInTheDocument(),
    );

    await openSearchDocsFromHelpMenu();

    expect(await screen.findByText('Docs chat')).toBeInTheDocument();
});

const breadcrumbs = () =>
    within(screen.getByRole('navigation', { name: 'Breadcrumbs' }));

const breadcrumbTrail = () =>
    breadcrumbs()
        .getAllByRole('listitem')
        .map((item) => item.textContent);

const mockDefaultProject = () =>
    testServerRoute(server, '/api/admin/projects', {
        projects: [{ id: 'default', name: 'Default' }],
    });

test('shows the sidebar item of a top-level page as its breadcrumb', () => {
    render(<AppShell>content</AppShell>, { route: '/personal' });

    expect(breadcrumbTrail()).toEqual(['Home']);
    expect(
        breadcrumbs().getByText('Home').closest('[aria-current="page"]'),
    ).toBeInTheDocument();
});

test('shows the project and its sidebar item as breadcrumbs of a project page', async () => {
    mockDefaultProject();
    render(<AppShell>content</AppShell>, { route: '/projects/default/logs' });

    await screen.findByRole('navigation', { name: 'Breadcrumbs' });
    expect(breadcrumbTrail()).toEqual(['Default', 'Event log']);
    expect(
        breadcrumbs().getByRole('link', { name: 'Default' }),
    ).toHaveAttribute('href', '/projects/default');
    expect(
        breadcrumbs().getByText('Event log').closest('[aria-current="page"]'),
    ).toBeInTheDocument();
});

test('shows the flag name as the last breadcrumb of a flag page', async () => {
    mockDefaultProject();
    render(<AppShell>content</AppShell>, {
        route: '/projects/default/features/my-flag',
    });

    await screen.findByRole('link', { name: 'Default' });
    expect(breadcrumbTrail()).toEqual(['Default', 'Flags', 'my-flag']);
    expect(breadcrumbs().getByRole('link', { name: 'Flags' })).toHaveAttribute(
        'href',
        '/projects/default',
    );
});

test('replaces the segment name with the flag name when moving from a segment to a flag', async () => {
    mockDefaultProject();
    testServerRoute(server, '/api/admin/segments/3', { name: 'beta-users' });
    render(
        <AppShell>
            <Link to='/projects/default/features/my-flag'>Open flag</Link>
        </AppShell>,
        { route: '/segments/edit/3' },
    );
    await screen.findByText('beta-users');

    await userEvent.click(screen.getByRole('link', { name: 'Open flag' }));

    await screen.findByText('my-flag');
    expect(breadcrumbTrail()).toEqual(['Default', 'Flags', 'my-flag']);
});

test('marks only the sidebar item as the current page on the project root', async () => {
    mockDefaultProject();
    render(<AppShell>content</AppShell>, { route: '/projects/default' });

    await screen.findByRole('navigation', { name: 'Breadcrumbs' });
    expect(breadcrumbTrail()).toEqual(['Default', 'Flags']);
    expect(
        breadcrumbs().getByRole('link', { name: 'Default' }),
    ).toHaveAttribute('href', '/projects/default');
    expect(
        breadcrumbs().getByText('Flags').closest('[aria-current="page"]'),
    ).toBeInTheDocument();
});

test('shows the Workspace section before the workspace configuration item as breadcrumbs of a workspace page', async () => {
    render(<AppShell>content</AppShell>, { route: '/context/create' });

    await screen.findByRole('navigation', { name: 'Breadcrumbs' });
    expect(
        breadcrumbs().getByRole('link', { name: 'Context fields' }),
    ).toHaveAttribute('href', '/context');
    expect(breadcrumbTrail()).toEqual([
        'Workspace',
        'Configure workspace',
        'Context fields',
    ]);
    expect(
        breadcrumbs().getByRole('link', { name: 'Workspace' }),
    ).toHaveAttribute('href', '/projects');
    expect(
        breadcrumbs().queryByRole('link', { name: 'Configure workspace' }),
    ).not.toBeInTheDocument();
});

test('shows no breadcrumbs on a page without a sidebar item', () => {
    render(<AppShell>content</AppShell>, { route: '/profile' });

    expect(
        screen.queryByRole('navigation', { name: 'Breadcrumbs' }),
    ).not.toBeInTheDocument();
});

const isBefore = (node: Node, other: Node) =>
    Boolean(
        node.compareDocumentPosition(other) & Node.DOCUMENT_POSITION_FOLLOWING,
    );

test('starts the main content at the breadcrumbs', () => {
    render(<AppShell>content</AppShell>, { route: '/search' });

    const startOfMainContent = screen.getByRole('link', {
        name: 'Start of main content',
    });
    const breadcrumbsNavigation = screen.getByRole('navigation', {
        name: 'Breadcrumbs',
    });

    expect(isBefore(startOfMainContent, breadcrumbsNavigation)).toBe(true);
});

const mainNavigation = () => screen.queryByRole('navigation', { name: 'Main' });

const openNavigationDrawer = async (route?: string) => {
    resizeScreen(SMALL_SCREEN);
    render(<AppShell>content</AppShell>, { route });
    await userEvent.click(
        screen.getByRole('button', { name: 'Open navigation' }),
    );
};

// A closing drawer stays in the DOM until its exit transition ends, so
// asserting that it stayed open has to run that transition out first.
const finishDrawerExitTransition = () =>
    act(() => vi.runOnlyPendingTimersAsync());

test('hides the sidebar behind a menu button on small screens', () => {
    resizeScreen(SMALL_SCREEN);

    render(<AppShell>content</AppShell>);

    expect(mainNavigation()).not.toBeInTheDocument();
    expect(
        screen.getByRole('button', { name: 'Open navigation' }),
    ).toBeInTheDocument();
});

test('opens the sidebar in a drawer from the menu button on small screens', async () => {
    await openNavigationDrawer();

    expect(
        within(mainNavigation()!).getByRole('link', { name: 'Home' }),
    ).toBeVisible();
});

test('closes the navigation drawer when clicking outside it', async () => {
    await openNavigationDrawer();

    await userEvent.click(document.querySelector(`.${backdropClasses.root}`)!);

    await waitFor(() => expect(mainNavigation()).not.toBeInTheDocument());
});

test('closes the navigation drawer after following a link in it', async () => {
    await openNavigationDrawer();

    await userEvent.click(
        within(mainNavigation()!).getByRole('link', { name: 'Projects' }),
    );

    await waitFor(() => expect(mainNavigation()).not.toBeInTheDocument());
});

test('closes the navigation drawer after following a link to the current page', async () => {
    await openNavigationDrawer('/projects');

    await userEvent.click(
        within(mainNavigation()!).getByRole('link', { name: 'Projects' }),
    );

    await waitFor(() => expect(mainNavigation()).not.toBeInTheDocument());
});

test('keeps the navigation drawer open when switching to the workspace configuration', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await openNavigationDrawer();

    await openConfigureWorkspace();
    await finishDrawerExitTransition();

    expect(
        within(mainNavigation()!).getByRole('region', {
            name: 'Configure workspace',
        }),
    ).toBeVisible();
});

test('shows the sidebar without a menu button on large screens', () => {
    render(<AppShell>content</AppShell>);

    expect(mainNavigation()).toBeInTheDocument();
    expect(
        screen.queryByRole('button', { name: 'Open navigation' }),
    ).not.toBeInTheDocument();
});
