import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { FeatureToggleListActions } from './FeatureToggleListActions';
import userEvent from '@testing-library/user-event';
import { testServerRoute, testServerSetup } from 'utils/testServer';

const server = testServerSetup();
test('all options are drawn', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        flags: {
            featuresExportImport: true,
        },
    });

    render(<FeatureToggleListActions onExportClick={() => {}} />);

    const batchReviveButton = await screen.findByTitle('Options');

    await userEvent.click(batchReviveButton!);

    await screen.findByText('New feature toggle');
    await screen.findByText('Export');
});
