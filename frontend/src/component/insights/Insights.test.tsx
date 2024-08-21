import { render } from '../../utils/testRenderer';
import { fireEvent, screen } from '@testing-library/react';
import { Insights } from './Insights';
import { testServerRoute, testServerSetup } from '../../utils/testServer';
import { vi } from 'vitest';

const server = testServerSetup();

const setupApi = () => {
    testServerRoute(server, '/api/admin/insights', {
        users: { total: 0, active: 0, inactive: 0 },
        userTrends: [],
        projectFlagTrends: [],
        metricsSummaryTrends: [],
        flags: { total: 0 },
        flagTrends: [],
        environmentTypeTrends: [],
    });

    testServerRoute(server, '/api/admin/projects', {
        projects: [
            { name: 'Project A Name', id: 'projectA' },
            { name: 'Project B Name', id: 'projectB' },
        ],
    });
};

const currentTime = '2024-04-25T08:05:00.000Z';

test('Filter insights by project and date', async () => {
    vi.setSystemTime(currentTime);
    setupApi();
    render(<Insights withCharts={false} />);
    const addFilter = await screen.findByText('Add Filter');
    fireEvent.click(addFilter);

    const dateFromFilter = await screen.findByText('Date From');
    await screen.findByText('Date To');
    const projectFilter = await screen.findByText('Project');

    // filter by project
    fireEvent.click(projectFilter);
    await screen.findByText('Project A Name');
    const projectName = await screen.findByText('Project B Name');
    await fireEvent.click(projectName);
    expect(window.location.href).toContain('project=IS%3AprojectB');

    // filter by from date
    fireEvent.click(dateFromFilter);
    const day = await screen.findByText('25');
    fireEvent.click(day);
    expect(window.location.href).toContain(
        'project=IS%3AprojectB&from=IS%3A2024-04-25',
    );
});
