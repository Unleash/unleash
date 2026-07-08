import { screen } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { expect, test } from 'vitest';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { FormField } from './FormField.tsx';

const server = testServerSetup();
const setTopLabel = (topLabelInputs: boolean) =>
    testServerRoute(server, '/api/admin/ui-config', {
        flags: { topLabelInputs },
    });

test('associates the static label with the control', async () => {
    setTopLabel(true);
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
    setTopLabel(true);
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
    setTopLabel(true);
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
    setTopLabel(true);
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

test('restores the floating label on the control when the flag is off', async () => {
    setTopLabel(false);
    render(
        <FormField label='Email'>
            <input />
        </FormField>,
    );

    const input = await screen.findByRole('textbox');

    expect(input).toHaveAttribute('label', 'Email');
    expect(screen.queryByText('Email')).not.toBeInTheDocument();
});

test("uses the control's own id rather than overwriting it", async () => {
    setTopLabel(true);
    render(
        <FormField label='Change request title'>
            <input id='group-name' />
        </FormField>,
    );

    const input = await screen.findByLabelText('Change request title');
    expect(input).toHaveAttribute('id', 'group-name');
});

test('renders a description element unchanged when the flag is off', async () => {
    setTopLabel(false);
    render(
        <FormField
            label='Project Id'
            description={
                <p data-testid='original' style={{ color: 'red' }}>
                    You can't change this later
                </p>
            }
        >
            <input />
        </FormField>,
    );

    const rendered = await screen.findByTestId('original');
    expect(rendered).toContainHTML(
        `<p data-testid="original" style="color: red;">You can't change this later</p>`,
    );
});

test('restyles the description text when the flag is on', async () => {
    setTopLabel(true);
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
    expect(screen.queryByTestId('original')).not.toBeInTheDocument();
    expect(screen.getByText("You can't change this later")).toBeInTheDocument();
});
