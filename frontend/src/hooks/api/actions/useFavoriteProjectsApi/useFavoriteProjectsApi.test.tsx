import { expect, test } from 'vitest';
import { http } from 'msw';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import useProjects from 'hooks/api/getters/useProjects/useProjects';
import { useFavoriteProjectsApi } from './useFavoriteProjectsApi.ts';

const server = testServerSetup();

const FavoriteProjects = () => {
    const { projects, loading } = useProjects();
    const { unfavorite } = useFavoriteProjectsApi();

    if (loading) {
        return null;
    }

    return (
        <>
            <p>
                Favorites:{' '}
                {projects
                    .filter(({ favorite }) => favorite)
                    .map(({ name }) => name)
                    .join(', ') || 'none'}
            </p>
            <button type='button' onClick={() => unfavorite('alpha')}>
                Unfavorite Alpha
            </button>
        </>
    );
};

test('refreshes the project list after removing a favorite', async () => {
    testServerRoute(server, '/api/admin/projects', {
        projects: [{ id: 'alpha', name: 'Alpha', favorite: true }],
    });
    server.use(
        http.delete('/api/admin/projects/alpha/favorites', () => {
            testServerRoute(server, '/api/admin/projects', {
                projects: [{ id: 'alpha', name: 'Alpha', favorite: false }],
            });
            return new Response(null, { status: 200 });
        }),
    );
    render(<FavoriteProjects />);
    await screen.findByText('Favorites: Alpha');

    await userEvent.click(
        screen.getByRole('button', { name: 'Unfavorite Alpha' }),
    );

    expect(await screen.findByText('Favorites: none')).toBeInTheDocument();
});
