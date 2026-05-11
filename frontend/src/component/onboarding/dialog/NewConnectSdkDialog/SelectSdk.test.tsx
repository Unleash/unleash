import { expect, test, vi } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SelectSdk } from './SelectSdk';

test('renders SDK buttons and calls onSelect on click', async () => {
    const onSelect = vi.fn();
    render(<SelectSdk onSelect={onSelect} />);

    expect(
        screen.getByRole('button', { name: /node\.js/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /react/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /node\.js/i }));
    expect(onSelect).toHaveBeenCalledWith({ name: 'Node.js', type: 'client' });

    await userEvent.click(screen.getByRole('button', { name: /react/i }));
    expect(onSelect).toHaveBeenCalledWith({ name: 'React', type: 'frontend' });
});
