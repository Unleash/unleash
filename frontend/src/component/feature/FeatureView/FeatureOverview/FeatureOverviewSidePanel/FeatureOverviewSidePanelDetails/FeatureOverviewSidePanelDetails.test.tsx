import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { FeatureOverviewSidePanelDetails } from './FeatureOverviewSidePanelDetails';
import { IFeatureToggle } from 'interfaces/featureToggle';
import { testServerRoute, testServerSetup } from 'utils/testServer';

const server = testServerSetup();

testServerRoute(server, '/api/admin/ui-config', {
    flags: {
        dependentFeatures: true,
    },
});

test('show dependency dialogue', async () => {
    render(
        <FeatureOverviewSidePanelDetails
            feature={{ name: 'feature' } as IFeatureToggle}
            header={''}
        />
    );

    const addParentButton = await screen.findByText('Add parent feature');

    addParentButton.click();

    expect(
        screen.getByText('Add parent feature dependency')
    ).toBeInTheDocument();
});
