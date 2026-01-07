import { render } from 'utils/testRenderer';
import { Route, Routes } from 'react-router-dom';
import BreadcrumbNav from './BreadcrumbNav.tsx';
import { screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('hooks/api/getters/useProjectOverview/useProjectOverview', () => {
    return {
        default: vi.fn(() => ({
            project: {
                id: '/my-project',
                name: 'My Test Project',
            },
            loading: false,
            error: null,
            refetch: vi.fn(),
        })),
    };
});

test('decode URI encoded path in breadcrumbs nav', async () => {
    render(
        <Routes>
            <Route
                path={'/applications/:name/:instance'}
                element={<BreadcrumbNav />}
            />
        </Routes>,
        {
            route: '/applications/my%20app/my%20instance',
        },
    );

    await screen.findByText('applications');
    await screen.findByText('my app');
    await screen.findByText('my instance');
});

test('use project name when in a project path', async () => {
    render(
        <Routes>
            <Route path={'/projects/:projectId'} element={<BreadcrumbNav />} />
        </Routes>,
        {
            route: '/projects/my-project',
        },
    );

    await screen.findByText('My Test Project');
});
