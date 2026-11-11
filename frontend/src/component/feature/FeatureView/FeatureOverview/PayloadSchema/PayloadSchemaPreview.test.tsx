import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import { render } from 'utils/testRenderer';
import { PayloadSchemaPreview } from './PayloadSchemaPreview.tsx';

test('renders an input for each supported property type, with a fallback', () => {
    const schema = {
        type: 'object',
        properties: {
            email: { type: 'string', title: 'Email' },
            tier: {
                type: 'string',
                title: 'Tier',
                description: 'Billing tier for this account.',
            },
            enabled: { type: 'boolean', title: 'Enabled' },
            color: { type: 'string', title: 'Color', enum: ['red', 'green'] },
            tags: { type: 'array', title: 'Tags', items: { type: 'string' } },
        },
    };

    render(<PayloadSchemaPreview schema={schema} />);

    const labels = [
        ...new Set(
            screen
                .getAllByText(/^(Email|Tier|Enabled|Color|Tags):?$/)
                .map((el) => el.textContent),
        ),
    ];
    expect(labels).toEqual(['Email', 'Tier', 'Enabled:', 'Color', 'Tags:']);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Tier')).toBeInTheDocument();
    expect(
        screen.getByText('Billing tier for this account.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Color')).toBeInTheDocument();
    expect(screen.queryByLabelText('Enabled')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Tags')).not.toBeInTheDocument();
    expect(screen.getAllByText(/not supported in a form view/)).toHaveLength(2);
});

test('renders a select for an enum property, with not-set option only when not required', async () => {
    const schema = {
        type: 'object',
        required: ['color'],
        properties: {
            color: { type: 'string', title: 'Color', enum: ['red', 'green'] },
            size: { type: 'string', title: 'Size', enum: ['s', 'm'] },
        },
        examples: [{ color: 'green', size: 'm' }],
    };

    render(<PayloadSchemaPreview schema={schema} />);

    await userEvent.click(screen.getByLabelText('Color'));
    expect(
        screen.queryByRole('option', { name: 'None' }),
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('option', { name: 'red' }));
    expect(screen.getByLabelText('Color')).toHaveTextContent('red');

    await userEvent.click(screen.getByLabelText('Size'));
    expect(screen.getByRole('option', { name: 'None' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('option', { name: 'None' }));
    expect(screen.getByLabelText('Size')).not.toHaveTextContent('m');
});

test('shows a placeholder instead of crashing when the schema is not an object yet', () => {
    render(<PayloadSchemaPreview schema={undefined} />);

    expect(screen.getByText(/write a valid json schema/i)).toBeInTheDocument();
});

test('carries numeric and string constraints onto the input as native HTML attributes, and disables readOnly properties', () => {
    const schema = {
        type: 'object',
        properties: {
            maxTokens: {
                type: 'integer',
                title: 'Max tokens',
                minimum: 1,
                maximum: 128000,
                multipleOf: 1,
            },
            name: {
                type: 'string',
                title: 'Name',
                minLength: 2,
                maxLength: 50,
                pattern: '^[a-z]+$',
                readOnly: true,
            },
            website: { type: 'string', title: 'Website', format: 'uri' },
        },
    };

    render(<PayloadSchemaPreview schema={schema} />);

    expect(screen.getByLabelText('Max tokens')).toMatchObject({
        type: 'number',
        min: '1',
        max: '128000',
        step: '1',
    });

    const { minLength, maxLength, pattern, disabled } =
        screen.getByLabelText<HTMLInputElement>('Name');
    expect({ minLength, maxLength, pattern, disabled }).toEqual({
        minLength: 2,
        maxLength: 50,
        pattern: '^[a-z]+$',
        disabled: true,
    });

    expect(screen.getByLabelText('Website')).toHaveAttribute('type', 'url');
});

test("initializes the preview with the schema's first example instance, and resets it when the schema changes", () => {
    const schema = {
        type: 'object',
        examples: [{ name: 'Ada' }],
        properties: {
            name: { type: 'string', title: 'Name' },
        },
    };

    const { rerender } = render(<PayloadSchemaPreview schema={schema} />);

    expect(screen.getByLabelText('Name')).toHaveValue('Ada');

    rerender(
        <PayloadSchemaPreview
            schema={{
                ...schema,
                examples: [{ name: 'Grace' }],
            }}
        />,
    );

    expect(screen.getByLabelText('Name')).toHaveValue('Grace');
});

test('renders a datetime-local input for a date-time format, converting the stored ISO value for display and back on change', () => {
    const schema = {
        type: 'object',
        examples: [{ until: '2024-03-10T08:30:00.000Z' }],
        properties: {
            until: { type: 'string', title: 'Until', format: 'date-time' },
        },
    };

    render(<PayloadSchemaPreview schema={schema} />);

    const until = screen.getByLabelText('Until');
    expect(until).toMatchObject({
        type: 'datetime-local',
        value: '2024-03-10T08:30',
    });

    fireEvent.change(until, { target: { value: '2024-04-01T12:00' } });

    expect(until).toHaveValue('2024-04-01T12:00');
});

test('renders a nested object property as its own group, with fields bound to their seeded value', () => {
    const schema = {
        type: 'object',
        examples: [{ address: { city: 'Oslo' } }],
        properties: {
            address: {
                type: 'object',
                title: 'Address',
                description: 'Where to ship the order.',
                properties: {
                    city: { type: 'string', title: 'City' },
                },
            },
        },
    };

    render(<PayloadSchemaPreview schema={schema} />);

    expect(screen.getByRole('group', { name: 'Address' })).toBeInTheDocument();
    expect(screen.getByText('Where to ship the order.')).toBeInTheDocument();
    expect(screen.getByLabelText('City')).toHaveValue('Oslo');
});
