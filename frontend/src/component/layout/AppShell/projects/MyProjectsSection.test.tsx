import { beforeEach, expect, test } from 'vitest';
import { screen, within } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { useProfile } from 'hooks/api/getters/useProfile/useProfile';
import { MyProjectsSection } from './MyProjectsSection.tsx';

const server = testServerSetup();

const setupApi = ({
    projects = [
        { id: 'alpha', name: 'Alpha', favorite: true },
        { id: 'beta', name: 'Beta' },
        { id: 'gamma', name: 'Gamma' },
    ],
    memberOf = ['beta'],
}: {
    projects?: { id: string; name: string; favorite?: boolean }[];
    memberOf?: string[];
} = {}) => {
    testServerRoute(server, '/api/admin/projects', { projects });
    testServerRoute(server, '/api/admin/user/profile', {
        projects: memberOf,
        rootRole: 'Editor',
        subscriptions: [],
        features: [],
    });
};

const renderSection = async (route = '/') => {
    const result = render(<MyProjectsSection />, { route });
    await screen.findByRole('region', { name: 'My projects' });
    return result;
};

beforeEach(() => {
    setupApi();
});

test('lists favorited projects and projects I am a member of', async () => {
    await renderSection();

    const section = within(screen.getByRole('region', { name: 'My projects' }));
    expect(section.getByRole('link', { name: 'Alpha' })).toHaveAttribute(
        'href',
        '/projects/alpha',
    );
    expect(section.getByRole('link', { name: 'Beta' })).toBeInTheDocument();
    expect(
        section.queryByRole('link', { name: 'Gamma' }),
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
