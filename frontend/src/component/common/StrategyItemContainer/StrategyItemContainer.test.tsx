import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { StrategyItemContainer } from './StrategyItemContainer';
import type { IFeatureStrategy } from 'interfaces/strategy';

test('should render strategy name, custom title and description', async () => {
    const strategy: IFeatureStrategy = {
        id: 'irrelevant',
        name: 'strategy name',
        title: 'custom title',
        constraints: [],
        parameters: {},
    };

    render(
        <StrategyItemContainer
            strategy={strategy}
            description={'description'}
        />,
    );

    expect(screen.getByText('strategy name')).toBeInTheDocument();
    expect(screen.getByText('description')).toBeInTheDocument();
    await screen.findByText('custom title'); // behind async flag
});
