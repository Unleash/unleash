import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { expect, test } from 'vitest';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { AutocompleteField } from './AutocompleteField.tsx';

const server = testServerSetup();
const setTopLabel = (topLabelInputs: boolean) =>
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { topLabelInputs },
    });

const options = ['One', 'Two'];

test('associates the top label with the combobox when the flag is on', async () => {
    setTopLabel(true);
    render(<AutocompleteField label='Environment' options={options} />);

    await screen.findByText('Environment');
    expect(screen.getByRole('combobox')).toHaveAccessibleName('Environment');
});

test('renders the description when the flag is on', async () => {
    setTopLabel(true);
    render(
        <AutocompleteField
            label='Environment'
            description='Pick an environment'
            options={options}
        />,
    );

    expect(await screen.findByText('Pick an environment')).toBeInTheDocument();
});

test('labels the combobox when the flag is off', async () => {
    setTopLabel(false);
    render(<AutocompleteField label='Environment' options={options} />);

    expect(await screen.findByLabelText('Environment')).toBe(
        screen.getByRole('combobox'),
    );
});
