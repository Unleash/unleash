import { beforeEach, expect, test } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { useProfile } from 'hooks/api/getters/useProfile/useProfile';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { MyProjectsSection } from './MyProjectsSection.tsx';

const server = testServerSetup();

const setupApi = ({
    projects = [
        { id: 'alpha', name: 'Alpha', favorite: true },
        { id: 'beta', name: 'Beta' },
        { id: 'gamma', name: 'Gamma' },
    ],
    memberOf = ['beta'],
    edition = 'enterprise',
}: {
    projects?: { id: string; name: string; favorite?: boolean }[];
    memberOf?: string[];
    edition?: 'enterprise' | 'oss';
} = {}) => {
    testServerRoute(server, '/api/admin/projects', { projects });
    testServerRoute(server, '/api/admin/user/profile', {
        projects: memberOf,
        rootRole: 'Editor',
        subscriptions: [],
        features: [],
    });
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: { current: { [edition]: 'version' } },
    });
};

// Before ui-config loads the edition reads as oss, so links that differ by
// edition are only meaningful once the config is known to be loaded.
const UiConfigLoaded = () => {
    const { loading } = useUiConfig();
    return loading ? null : 'ui config loaded';
};

const renderSection = async (route = '/') => {
    const result = render(
        <>
            <MyProjectsSection />
            <UiConfigLoaded />
        </>,
        { route },
    );
    await screen.findByText('ui config loaded');
    await screen.findByRole('region', { name: 'My projects' });
    return result;
};

const projectToggle = (name: string) => screen.getByRole('button', { name });

const projectGroup = (name: string) =>
    within(screen.getByRole('group', { name }));

beforeEach(() => {
    localStorage.clear();
    setupApi();
});

test('lists favorited projects and projects I am a member of', async () => {
    await renderSection();

    const section = within(screen.getByRole('region', { name: 'My projects' }));
    expect(section.getByRole('button', { name: 'Alpha' })).toBeInTheDocument();
    expect(section.getByRole('button', { name: 'Beta' })).toBeInTheDocument();
    expect(
        section.queryByRole('button', { name: 'Gamma' }),
    ).not.toBeInTheDocument();
});

test('points to the projects list when there are no projects of mine', async () => {
    setupApi({ projects: [{ id: 'gamma', name: 'Gamma' }], memberOf: [] });

    await renderSection();

    expect(
        screen.getByRole('link', { name: 'Favorite a project to see it here' }),
    ).toHaveAttribute('href', '/projects');
});

const RequestsSettled = () => {
    const { loading: projectsLoading } = useProjects();
    const { loading: profileLoading } = useProfile();
    return projectsLoading || profileLoading ? null : 'requests settled';
};

test.each([
    '/api/admin/projects',
    '/api/admin/user/profile',
])('hides the section when %s fails to load', async (path) => {
    testServerRoute(server, path, {}, 'get', 500);

    render(
        <>
            <MyProjectsSection />
            <RequestsSettled />
        </>,
    );

    await screen.findByText('requests settled');
    expect(
        screen.queryByRole('region', { name: 'My projects' }),
    ).not.toBeInTheDocument();
});

test('expands a project to Flags and Change requests when clicked', async () => {
    await renderSection();
    expect(projectToggle('Alpha')).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(projectToggle('Alpha'));

    expect(projectToggle('Alpha')).toHaveAttribute('aria-expanded', 'true');
    const group = projectGroup('Alpha');
    expect(group.getByRole('link', { name: 'Flags' })).toHaveAttribute(
        'href',
        '/projects/alpha',
    );
    expect(
        group.getByRole('link', { name: 'Change requests' }),
    ).toHaveAttribute('href', '/projects/alpha/change-requests');
    expect(
        group.queryByRole('link', { name: 'Event log' }),
    ).not.toBeInTheDocument();
});

test('reveals Event log and Configure project under More', async () => {
    await renderSection('/projects/alpha');
    const group = projectGroup('Alpha');

    await userEvent.click(group.getByRole('button', { name: 'More' }));

    expect(group.getByRole('link', { name: 'Event log' })).toHaveAttribute(
        'href',
        '/projects/alpha/logs',
    );
    expect(
        group.getByRole('link', { name: 'Configure project' }),
    ).toHaveAttribute('href', '/projects/alpha/settings');
});

test('collapses an expanded project when clicked again', async () => {
    await renderSection();
    await userEvent.click(projectToggle('Alpha'));

    await userEvent.click(projectToggle('Alpha'));

    expect(projectToggle('Alpha')).toHaveAttribute('aria-expanded', 'false');
    expect(
        screen.queryByRole('group', { name: 'Alpha' }),
    ).not.toBeInTheDocument();
});

test('expands the project the current page belongs to', async () => {
    await renderSection('/projects/alpha/change-requests');

    expect(projectToggle('Alpha')).toHaveAttribute('aria-expanded', 'true');
    expect(projectToggle('Beta')).toHaveAttribute('aria-expanded', 'false');
});

test('marks the current page in its project', async () => {
    await renderSection('/projects/alpha/change-requests/1');

    expect(projectToggle('Alpha')).toHaveAttribute('aria-current', 'location');
    expect(projectToggle('Beta')).not.toHaveAttribute('aria-current');
    const group = projectGroup('Alpha');
    expect(
        group.getByRole('link', { name: 'Change requests' }),
    ).toHaveAttribute('aria-current', 'page');
    expect(group.getByRole('link', { name: 'Flags' })).not.toHaveAttribute(
        'aria-current',
    );
});

test('marks Flags as current on a flag page', async () => {
    await renderSection('/projects/alpha/features/my-flag');

    expect(
        projectGroup('Alpha').getByRole('link', { name: 'Flags' }),
    ).toHaveAttribute('aria-current', 'page');
});

test.each([
    ['/projects/alpha/logs', 'Event log'],
    ['/projects/alpha/settings/access', 'Configure project'],
])('opens More when the current page %s is in it', async (route, label) => {
    await renderSection(route);
    const group = projectGroup('Alpha');

    expect(group.getByRole('button', { name: 'Less' })).toHaveAttribute(
        'aria-expanded',
        'true',
    );
    expect(group.getByRole('link', { name: label })).toHaveAttribute(
        'aria-current',
        'page',
    );
});

test('marks only the project as current on a project page outside the sidebar', async () => {
    await renderSection('/projects/alpha/applications');

    expect(projectToggle('Alpha')).toHaveAttribute('aria-current', 'location');
    expect(
        projectGroup('Alpha').getByRole('link', { name: 'Flags' }),
    ).not.toHaveAttribute('aria-current');
});

test('keeps a collapsed current project collapsed after the sidebar remounts', async () => {
    const { unmount } = await renderSection('/projects/alpha/logs');
    await userEvent.click(projectToggle('Alpha'));
    unmount();

    await renderSection('/projects/alpha/logs');

    expect(projectToggle('Alpha')).toHaveAttribute('aria-expanded', 'false');
});

test('keeps More open after the project is collapsed and reopened', async () => {
    await renderSection('/projects/alpha');
    await userEvent.click(
        projectGroup('Alpha').getByRole('button', { name: 'More' }),
    );

    await userEvent.click(projectToggle('Alpha'));
    await userEvent.click(projectToggle('Alpha'));

    expect(
        projectGroup('Alpha').getByRole('button', { name: 'Less' }),
    ).toHaveAttribute('aria-expanded', 'true');
});

test('hides Change requests on oss', async () => {
    setupApi({ edition: 'oss' });

    await renderSection('/projects/alpha');

    expect(
        projectGroup('Alpha').queryByRole('link', { name: 'Change requests' }),
    ).not.toBeInTheDocument();
});

test('links Configure project to API access on oss', async () => {
    setupApi({ edition: 'oss' });

    await renderSection('/projects/alpha');
    const group = projectGroup('Alpha');
    await userEvent.click(group.getByRole('button', { name: 'More' }));

    expect(
        group.getByRole('link', { name: 'Configure project' }),
    ).toHaveAttribute('href', '/projects/alpha/settings/api-access');
});
