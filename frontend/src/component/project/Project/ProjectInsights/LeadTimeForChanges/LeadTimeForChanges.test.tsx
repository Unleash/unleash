import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import type { ProjectDoraMetricsSchema } from 'openapi';
import { LeadTimeForChanges } from './LeadTimeForChanges';
import { Route, Routes } from 'react-router-dom';

test('Show outdated SDKs and apps using them', async () => {
    const leadTime: ProjectDoraMetricsSchema = {
        features: [
            {
                name: 'ABCD',
                timeToProduction: 57,
            },
        ],
        projectAverage: 67,
    };
    render(
        <Routes>
            <Route
                path={'/projects/:projectId'}
                element={
                    <LeadTimeForChanges leadTime={leadTime} loading={false} />
                }
            />
        </Routes>,
        {
            route: '/projects/default',
        },
    );

    await screen.findByText('Lead time for changes (per release flag)');
    await screen.findByText('ABCD');
    await screen.findByText('57 days');
    await screen.findByText('Low');
    await screen.findByText('10 days');
});
