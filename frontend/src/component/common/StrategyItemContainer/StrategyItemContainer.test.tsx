import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { StrategyItemContainer } from './StrategyItemContainer';
import { IFeatureStrategy } from 'interfaces/strategy';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { UIProviderContainer } from '../../providers/UIProvider/UIProviderContainer';

const server = testServerSetup();
testServerRoute(server, '/api/admin/ui-config', {
    flags: { strategyImprovements: true },
});

test('should render authorization error on missing old password', async () => {
    const strategy: IFeatureStrategy = {
        id: 'irrelevant',
        name: 'strategy name',
        title: 'custom title',
        constraints: [],
        parameters: {},
    };

    render(
        <UIProviderContainer>
            <StrategyItemContainer
                strategy={strategy}
                description={'description'}
            />
        </UIProviderContainer>
    );

    expect(screen.getByText('strategy name')).toBeInTheDocument();
    expect(screen.getByText('description')).toBeInTheDocument();
    await screen.findByText('custom title'); // behind async flag
});
