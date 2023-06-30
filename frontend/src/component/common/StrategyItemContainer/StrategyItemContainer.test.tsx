import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { StrategyItemContainer } from './StrategyItemContainer';
import { IFeatureStrategy } from 'interfaces/strategy';
import { UIProviderContainer } from '../../providers/UIProvider/UIProviderContainer';

test('should render strategy name, custom title and description', async () => {
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
