import { render } from 'utils/testRenderer';
import { Insights } from './Insights.tsx';
import { testServerRoute, testServerSetup } from 'utils/testServer';

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
        lifecycleTrends: [],
        creationArchiveTrends: [],
    });

    testServerRoute(server, '/api/admin/projects', {
        projects: [
            { name: 'Project A Name', id: 'projectA' },
            { name: 'Project B Name', id: 'projectB' },
        ],
    });
};

test('should render', () => {
    setupApi();
    render(<Insights />);
});
