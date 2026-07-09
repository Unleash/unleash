import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { expect, test } from 'vitest';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { SelectField } from './SelectField.tsx';

const server = testServerSetup();
const setTopLabel = (topLabelInputs: boolean) =>
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { topLabelInputs },
    });

const options = [
    { key: 'dev', label: 'Development' },
    { key: 'prod', label: 'Production' },
];

test('associates the top label with the select when the flag is on', async () => {
    setTopLabel(true);
    render(
        <SelectField
            label='Environment'
            value='dev'
            onChange={() => {}}
            options={options}
        />,
    );

    await screen.findByText('Environment');
    expect(screen.getByRole('combobox')).toHaveAccessibleName('Environment');
});

test('renders the description when the flag is on', async () => {
    setTopLabel(true);
    render(
        <SelectField
            label='Environment'
            description='Pick an environment'
            value='dev'
            onChange={() => {}}
            options={options}
        />,
    );

    expect(await screen.findByText('Pick an environment')).toBeInTheDocument();
});

test('labels the select when the flag is off', async () => {
    setTopLabel(false);
    render(
        <SelectField
            label='Environment'
            value='dev'
            onChange={() => {}}
            options={options}
        />,
    );

    expect(await screen.findByRole('combobox')).toHaveAccessibleName(
        'Environment',
    );
});
