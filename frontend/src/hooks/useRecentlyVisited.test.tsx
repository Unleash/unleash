import type { FC } from 'react';
import { render, screen } from '@testing-library/react';
import {
    MemoryRouter as Router,
    Routes,
    Route,
    Navigate,
    RouterProvider,
    createMemoryRouter,
} from 'react-router-dom';
import { useRecentlyVisited } from './useRecentlyVisited.ts';
import { RecentlyVisitedRecorder } from 'component/commandBar/RecentlyVisitedRecorder';

const RouteNameRender: FC<{}> = () => {
    const { lastVisited } = useRecentlyVisited();
    return (
        <div>
            <RecentlyVisitedRecorder />
            {lastVisited.map((visited, index) => (
                <div key={index}>{visited.pathName}</div>
            ))}
        </div>
    );
};

beforeEach(() => {
    window.localStorage.clear();
});

test('checks that routes that exist in routes.ts gets added to lastVisited', async () => {
    render(
        <Router initialEntries={['/']}>
            <RouteNameRender />
            <Routes>
                <Route path='/' element={<Navigate to={'/search'} />} />
                <Route path='/search' element={<Navigate to={'/unknown1'} />} />
                <Route
                    path='/unknown1'
                    element={<Navigate to={'/unknown2'} />}
                />
                <Route
                    path='/unknown2'
                    element={<Navigate to={'/integrations'} />}
                />
                <Route
                    path='/integrations'
                    element={<Navigate to={'/unknown3'} />}
                />
                <Route
                    path='/unknown3'
                    element={<Navigate to={'/unknown4'} />}
                />
                <Route
                    path='/unknown4'
                    element={<Navigate to={'/segments'} />}
                />
                <Route path='/segments' element={<div>segment div</div>} />
            </Routes>
        </Router>,
    );
    await screen.findByText('/search');
    await screen.findByText('/integrations');
    await screen.findByText('/segments');
    await screen.findByText('segment div');
});

test('visiting gets added to the list', async () => {
    const router = createMemoryRouter([
        { path: '/search', element: <RouteNameRender /> },
        { path: '/projects', element: <RouteNameRender /> },
        { path: '/', element: <RouteNameRender /> },
    ]);
    render(<RouterProvider router={router} />);
    router.navigate('/search');
    await screen.findByText('/search');
    router.navigate('/projects');
    await screen.findByText('/projects');
});
