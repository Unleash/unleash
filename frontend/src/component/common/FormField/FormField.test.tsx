import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { expect, test } from 'vitest';
import { FormField } from './FormField.tsx';

test('associates the static label with the control', () => {
    render(
        <FormField label='Email'>
            <input />
        </FormField>,
    );

    // getByLabelText resolves the <label htmlFor> → the id FormField injects
    // onto the control, so the control is programmatically named.
    expect(screen.getByLabelText('Email')).toBe(screen.getByRole('textbox'));
});

test('renders the description and wires it via aria-describedby', () => {
    render(
        <FormField label='API token' description='Paste your API token'>
            <input />
        </FormField>,
    );

    const input = screen.getByRole('textbox');
    const description = screen.getByText('Paste your API token');

    expect(description).toBeInTheDocument();
    expect(input.getAttribute('aria-describedby')).toContain(description.id);
});

test("preserves the control's own aria-describedby", () => {
    render(
        <FormField label='Email' description='We never share it'>
            <input aria-describedby='external-help' />
        </FormField>,
    );

    expect(
        screen.getByRole('textbox').getAttribute('aria-describedby'),
    ).toContain('external-help');
});

test('forwards data-testid to the field container', () => {
    render(
        <FormField label='Email' data-testid='email-field'>
            <input />
        </FormField>,
    );

    expect(screen.getByTestId('email-field')).toBeInTheDocument();
});
