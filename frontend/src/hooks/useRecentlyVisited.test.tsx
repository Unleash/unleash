import type { FC } from 'react';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { useRecentlyVisited } from './useRecentlyVisited';

const RouteNameRender: FC<{}> = () => {
    const { lastVisited } = useRecentlyVisited();
    return <div>{lastVisited[0]?.pathName}</div>;
};

beforeEach(() => {
    window.localStorage.clear();
});

test('visiting gets added to the list', async () => {
    const router = createMemoryRouter([
        { path: '/search', element: <RouteNameRender /> },
        { path: '/projects', element: <RouteNameRender /> },
        { path: '/', element: <RouteNameRender /> },
    ]);
    render(<RouterProvider router={router} />);
    router.navigate('/');
    router.navigate('/search');
    await screen.findByText('/search');
    router.navigate('/projects');
    await screen.findByText('/projects');
});
