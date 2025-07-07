import { render } from 'utils/testRenderer';
import { Route, Routes } from 'react-router-dom';
import BreadcrumbNav from './BreadcrumbNav.tsx';
import { screen } from '@testing-library/react';

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
