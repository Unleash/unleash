import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { expect, test } from 'vitest';
import { SelectField } from './SelectField.tsx';

const options = [
    { key: 'dev', label: 'Development' },
    { key: 'prod', label: 'Production' },
];

test('associates the top label with the select', async () => {
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

test('renders the description', async () => {
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
