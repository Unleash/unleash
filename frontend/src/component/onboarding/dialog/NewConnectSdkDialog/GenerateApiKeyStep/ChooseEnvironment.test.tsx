import { expect, test, vi } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChooseEnvironment } from './ChooseEnvironment';

test('calls onSelect with chosen environment', async () => {
    const onSelect = vi.fn();
    render(
        <ChooseEnvironment
            environments={['production', 'development', 'staging']}
            currentEnvironment='production'
            onSelect={onSelect}
        />,
    );

    expect(screen.getByRole('combobox')).toHaveTextContent('production');
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(
        within(screen.getByRole('listbox')).getByText('staging'),
    );

    expect(onSelect).toHaveBeenCalledWith('staging');
    expect(onSelect).toHaveBeenCalledTimes(1);
});
