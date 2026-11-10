import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { expect, test } from 'vitest';
import { AutocompleteField } from './AutocompleteField.tsx';

const options = ['One', 'Two'];

test('associates the top label with the combobox', async () => {
    render(<AutocompleteField label='Environment' options={options} />);

    await screen.findByText('Environment');
    expect(screen.getByRole('combobox')).toHaveAccessibleName('Environment');
});

test('renders the description', async () => {
    render(
        <AutocompleteField
            label='Environment'
            description='Pick an environment'
            options={options}
        />,
    );

    expect(await screen.findByText('Pick an environment')).toBeInTheDocument();
});
