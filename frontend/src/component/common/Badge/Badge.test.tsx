import { screen } from '@testing-library/react';
import { Badge } from './Badge.tsx';
import { render } from 'utils/testRenderer';

test('Badge should render text', async () => {
    render(<Badge color='success'>Predefined</Badge>);

    const result = await screen.findByText('Predefined');
    expect(result).toBeInTheDocument();
});

test('Badge should children number 0', async () => {
    render(<Badge color='success'>{0}</Badge>);

    const result = await screen.findByText('0');
    expect(result).toBeInTheDocument();
});
