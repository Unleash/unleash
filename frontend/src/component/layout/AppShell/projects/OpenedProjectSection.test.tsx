import type { ReactNode } from 'react';
import { beforeEach, expect, test } from 'vitest';
import { Link } from 'react-router';
import { http } from 'msw';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { useProfile } from 'hooks/api/getters/useProfile/useProfile';
import { OpenedProjectSection } from './OpenedProjectSection.tsx';

const server = testServerSetup();

beforeEach(() => {
    sessionStorage.clear();
    testServerRoute(server, '/api/admin/projects', {
        projects: [
            { id: 'alpha', name: 'Alpha', favorite: true },
            { id: 'beta', name: 'Beta' },
            { id: 'gamma', name: 'Gamma' },
        ],
    });
    testServerRoute(server, '/api/admin/user/profile', {
        projects: [],
        rootRole: 'Editor',
        subscriptions: [],
        features: [],
    });
});

const RequestsSettled = () => {
    const { loading: projectsLoading } = useProjects();
    const { loading: profileLoading } = useProfile();
    return projectsLoading || profileLoading ? null : 'requests settled';
};

const ProjectsLoaded = () => {
    const { loading } = useProjects();
    return loading ? null : 'projects loaded';
};

const RefetchProjects = () => {
    const { refetch } = useProjects();
    return (
        <button type='button' onClick={refetch}>
            Refetch
        </button>
    );
};

const renderSection = async (route: string, extra?: ReactNode) => {
    const result = render(
        <>
            <OpenedProjectSection />
            <RequestsSettled />
            {extra}
        </>,
        { route },
    );
    await screen.findByText('requests settled');
    return result;
};

const openedSection = () =>
    screen.queryByRole('region', { name: 'Opened projects' });

const openedProject = (name: string) =>
    within(screen.getByRole('region', { name: 'Opened projects' })).queryByRole(
        'button',
        { name },
    );

const projectGroup = (name: string) =>
    within(screen.getByRole('group', { name }));

test('shows the current project when it is not one of my projects', async () => {
    await renderSection('/projects/gamma/logs');

    expect(openedProject('Gamma')).toBeInTheDocument();
});

test.each([
    '/projects/alpha',
    '/personal',
])('hides the section on %s when no other project was opened', async (route) => {
    await renderSection(route);

    expect(openedSection()).not.toBeInTheDocument();
});

test.each([
    '/personal',
    '/projects/alpha',
])('keeps the opened project after leaving it for %s', async (destination) => {
    await renderSection('/projects/gamma', <Link to={destination}>Leave</Link>);

    await userEvent.click(screen.getByRole('link', { name: 'Leave' }));

    expect(openedProject('Gamma')).toBeInTheDocument();
});

test.each([
    '/api/admin/projects',
    '/api/admin/user/profile',
])('hides the section when %s fails to load', async (path) => {
    testServerRoute(server, path, {}, 'get', 500);

    await renderSection('/projects/gamma');

    expect(openedSection()).not.toBeInTheDocument();
});

test('keeps More open on the opened project after leaving it', async () => {
    await renderSection('/projects/gamma', <Link to='/personal'>Go home</Link>);
    await userEvent.click(
        projectGroup('Gamma').getByRole('button', { name: 'More' }),
    );
    await userEvent.click(screen.getByRole('link', { name: 'Go home' }));

    await userEvent.click(screen.getByRole('button', { name: 'Gamma' }));

    expect(
        projectGroup('Gamma').getByRole('button', { name: 'Less' }),
    ).toHaveAttribute('aria-expanded', 'true');
});

test('keeps More open after returning to the opened project', async () => {
    await renderSection(
        '/projects/gamma',
        <>
            <Link to='/personal'>Go home</Link>
            <Link to='/projects/gamma'>Back to Gamma</Link>
        </>,
    );
    await userEvent.click(
        projectGroup('Gamma').getByRole('button', { name: 'More' }),
    );
    await userEvent.click(screen.getByRole('link', { name: 'Go home' }));

    await userEvent.click(screen.getByRole('link', { name: 'Back to Gamma' }));

    expect(
        projectGroup('Gamma').getByRole('button', { name: 'Less' }),
    ).toHaveAttribute('aria-expanded', 'true');
});

test('starts the next opened project with More closed', async () => {
    await renderSection(
        '/projects/gamma',
        <Link to='/projects/beta'>Open Beta</Link>,
    );
    await userEvent.click(
        projectGroup('Gamma').getByRole('button', { name: 'More' }),
    );

    await userEvent.click(screen.getByRole('link', { name: 'Open Beta' }));

    expect(
        projectGroup('Beta').getByRole('button', { name: 'More' }),
    ).toHaveAttribute('aria-expanded', 'false');
});

test('replaces the opened project with the next one opened', async () => {
    await renderSection(
        '/projects/gamma',
        <Link to='/projects/beta'>Open Beta</Link>,
    );

    await userEvent.click(screen.getByRole('link', { name: 'Open Beta' }));

    expect(openedProject('Beta')).toBeInTheDocument();
    expect(openedProject('Gamma')).not.toBeInTheDocument();
});

test('keeps the opened project on a project route that is not a project', async () => {
    await renderSection(
        '/projects/gamma',
        <Link to='/projects/create'>Create project</Link>,
    );

    await userEvent.click(screen.getByRole('link', { name: 'Create project' }));

    expect(openedProject('Gamma')).toBeInTheDocument();
});

test('hides the opened project once it becomes one of my projects', async () => {
    await renderSection(
        '/projects/gamma',
        <>
            <Link to='/personal'>Go home</Link>
            <RefetchProjects />
        </>,
    );
    await userEvent.click(screen.getByRole('link', { name: 'Go home' }));
    testServerRoute(server, '/api/admin/projects', {
        projects: [{ id: 'gamma', name: 'Gamma', favorite: true }],
    });

    await userEvent.click(screen.getByRole('button', { name: 'Refetch' }));

    await waitFor(() => expect(openedSection()).not.toBeInTheDocument());
});

test('hides the section until it is known which projects are mine', async () => {
    server.use(
        http.get('/api/admin/user/profile', () => new Promise(() => {})),
    );
    render(
        <>
            <OpenedProjectSection />
            <ProjectsLoaded />
        </>,
        { route: '/projects/beta' },
    );

    await screen.findByText('projects loaded');

    expect(openedSection()).not.toBeInTheDocument();
});

test('keeps the opened project with More open after a reload', async () => {
    const { unmount } = await renderSection('/projects/gamma');
    await userEvent.click(
        projectGroup('Gamma').getByRole('button', { name: 'More' }),
    );
    unmount();

    await renderSection('/personal');
    await userEvent.click(screen.getByRole('button', { name: 'Gamma' }));

    expect(
        projectGroup('Gamma').getByRole('button', { name: 'Less' }),
    ).toHaveAttribute('aria-expanded', 'true');
});

test('hides the opened project once it is added to favorites', async () => {
    server.use(
        http.post('/api/admin/projects/gamma/favorites', () => {
            testServerRoute(server, '/api/admin/projects', {
                projects: [{ id: 'gamma', name: 'Gamma', favorite: true }],
            });
            return new Response(null, { status: 200 });
        }),
    );
    await renderSection('/projects/gamma');

    await userEvent.click(
        screen.getByRole('button', { name: 'Add Gamma to favorites' }),
    );

    await waitFor(() => expect(openedSection()).not.toBeInTheDocument());
});

test('removes the opened project from the sidebar after leaving it', async () => {
    await renderSection('/projects/gamma', <Link to='/personal'>Go home</Link>);
    await userEvent.click(screen.getByRole('link', { name: 'Go home' }));

    await userEvent.click(
        screen.getByRole('button', { name: 'Remove Gamma from sidebar' }),
    );

    expect(openedSection()).not.toBeInTheDocument();
});

test('opens a removed project again when it is visited', async () => {
    await renderSection(
        '/projects/gamma',
        <>
            <Link to='/personal'>Go home</Link>
            <Link to='/projects/gamma'>Back to Gamma</Link>
        </>,
    );
    await userEvent.click(screen.getByRole('link', { name: 'Go home' }));
    await userEvent.click(
        screen.getByRole('button', { name: 'Remove Gamma from sidebar' }),
    );

    await userEvent.click(screen.getByRole('link', { name: 'Back to Gamma' }));

    expect(openedProject('Gamma')).toBeInTheDocument();
});
