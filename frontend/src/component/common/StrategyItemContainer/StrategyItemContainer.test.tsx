import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import type { IFeatureStrategy } from 'interfaces/strategy';
import { StrategyItemContainer } from './StrategyItemContainer.tsx';

test('should render strategy name, custom title and description', async () => {
    const strategy: IFeatureStrategy = {
        id: 'irrelevant',
        name: 'strategy name',
        title: 'custom title',
        constraints: [],
        parameters: {},
    };

    render(<StrategyItemContainer strategy={strategy} />);

    expect(screen.getByText('strategy name:')).toBeInTheDocument();
    await screen.findByText('custom title'); // behind async flag
});
