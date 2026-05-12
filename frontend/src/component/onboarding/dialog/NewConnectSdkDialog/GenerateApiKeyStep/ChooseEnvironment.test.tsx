import { expect, test, vi } from 'vitest';
import { render } from 'utils/testRenderer';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChooseEnvironment } from './ChooseEnvironment';

const environments = ['production', 'development', 'staging'];

test('renders the current environment as selected value', () => {
    render(
        <ChooseEnvironment
            environments={environments}
            currentEnvironment='development'
            onSelect={vi.fn()}
        />,
    );

    expect(screen.getByRole('combobox')).toHaveTextContent('development');
});

test('calls onSelect with chosen environment', async () => {
    const onSelect = vi.fn();
    render(
        <ChooseEnvironment
            environments={environments}
            currentEnvironment='production'
            onSelect={onSelect}
        />,
    );

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(
        within(screen.getByRole('listbox')).getByText('staging'),
    );

    expect(onSelect).toHaveBeenCalledWith('staging');
    expect(onSelect).toHaveBeenCalledTimes(1);
});

test('does not open menu when disabled', async () => {
    render(
        <ChooseEnvironment
            environments={environments}
            currentEnvironment='production'
            onSelect={vi.fn()}
            disabled
        />,
    );

    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
});

test('renders with no crash when environments is empty', () => {
    render(
        <ChooseEnvironment
            environments={[]}
            currentEnvironment=''
            onSelect={vi.fn()}
        />,
    );

    expect(screen.getByRole('combobox')).toBeInTheDocument();
});

test('has an accessible label', () => {
    render(
        <ChooseEnvironment
            environments={environments}
            currentEnvironment='production'
            onSelect={vi.fn()}
        />,
    );

    expect(
        screen.getByRole('combobox', { name: /select environment/i }),
    ).toBeInTheDocument();
});
