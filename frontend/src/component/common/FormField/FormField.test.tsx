import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { expect, test } from 'vitest';
import { FormField } from './FormField.tsx';

test('associates the static label with the control', async () => {
    render(
        <FormField label='Email'>
            <input />
        </FormField>,
    );

    expect(await screen.findByLabelText('Email')).toBe(
        screen.getByRole('textbox'),
    );
});

test('renders the description and wires it via aria-describedby', async () => {
    render(
        <FormField label='API token' description='Paste your API token'>
            <input />
        </FormField>,
    );

    const description = await screen.findByText('Paste your API token');

    expect(
        screen.getByRole('textbox').getAttribute('aria-describedby'),
    ).toContain(description.id);
});

test("merges the description with the control's own aria-describedby", async () => {
    render(
        <FormField label='Email' description='We never share it'>
            <input aria-describedby='external-help' />
        </FormField>,
    );

    const description = await screen.findByText('We never share it');
    const describedBy = screen
        .getByRole('textbox')
        .getAttribute('aria-describedby');

    expect(describedBy).toContain('external-help');
    expect(describedBy).toContain(description.id);
});

test('sets no aria-describedby when there is neither', async () => {
    render(
        <FormField label='Email'>
            <input />
        </FormField>,
    );

    await screen.findByLabelText('Email');

    expect(screen.getByRole('textbox').hasAttribute('aria-describedby')).toBe(
        false,
    );
});

test("uses the control's own id rather than overwriting it", async () => {
    render(
        <FormField label='Change request title'>
            <input id='group-name' />
        </FormField>,
    );

    const input = await screen.findByLabelText('Change request title');
    expect(input).toHaveAttribute('id', 'group-name');
});

test('restyles the description text but keeps its data-testid', async () => {
    render(
        <FormField
            label='Project Id'
            description={
                <p data-testid='original'>You can't change this later</p>
            }
        >
            <input />
        </FormField>,
    );

    await screen.findByText('Project Id');
    const description = screen.getByTestId('original');
    expect(description).toHaveTextContent("You can't change this later");
});
