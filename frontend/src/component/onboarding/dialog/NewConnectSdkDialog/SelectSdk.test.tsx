import { expect, test, vi } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SelectSdk } from './SelectSdk';

test('renders SDK buttons, shows no selection, and calls onSelect on click', async () => {
    const onSelect = vi.fn();
    render(<SelectSdk onSelect={onSelect} />);

    expect(screen.getAllByText('Select').length).toBeGreaterThan(0);
    expect(screen.queryAllByText('Selected')).toHaveLength(0);

    await userEvent.click(screen.getByRole('button', { name: /node\.js/i }));
    expect(onSelect).toHaveBeenCalledWith({ name: 'Node.js', type: 'client' });

    await userEvent.click(screen.getByRole('button', { name: /react/i }));
    expect(onSelect).toHaveBeenCalledWith({ name: 'React', type: 'frontend' });
});

test('marks the matching sdk as selected', () => {
    render(
        <SelectSdk
            onSelect={vi.fn()}
            sdk={{ name: 'Node.js', type: 'client' }}
        />,
    );

    expect(screen.getByText('Selected')).toBeInTheDocument();
    expect(screen.getAllByText('Select').length).toBeGreaterThan(0);
});

test('shows no selection when sdk name does not match any sdk', () => {
    render(
        <SelectSdk
            onSelect={vi.fn()}
            sdk={{ name: 'NonExistent' as never, type: 'client' }}
        />,
    );

    expect(screen.queryAllByText('Selected')).toHaveLength(0);
});
