import { fireEvent, screen, within } from '@testing-library/react';
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
            webhook: {
                type: 'string',
                title: 'Webhook',
                oneOf: [{ const: 'slack' }, { const: 'teams' }],
            },
        },
    };

    render(<PayloadSchemaPreview schema={schema} />);

    const labels = [
        ...new Set(
            screen
                .getAllByText(/^(Email|Tier|Enabled|Color|Webhook):?$/)
                .map((el) => el.textContent),
        ),
    ];
    expect(labels).toEqual(['Email', 'Tier', 'Enabled', 'Color', 'Webhook:']);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Tier')).toBeInTheDocument();
    expect(
        screen.getByText('Billing tier for this account.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Color')).toBeInTheDocument();
    expect(screen.getByLabelText('Enabled')).toBeInTheDocument();
    expect(screen.queryByLabelText('Webhook')).not.toBeInTheDocument();
    expect(screen.getAllByText(/not supported in a form view/)).toHaveLength(1);
});

test('renders an array property as a list of groups, with add/remove controls', async () => {
    const schema = {
        type: 'object',
        properties: {
            tags: {
                type: 'array',
                title: 'Tags',
                items: { type: 'string' },
                maxItems: 2,
            },
        },
        examples: [{ tags: ['first'] }],
    };

    render(<PayloadSchemaPreview schema={schema} />);

    expect(screen.getByLabelText('Tags 1')).toHaveValue('first');
    expect(screen.getByText('Tags')).toBeInTheDocument(); // group heading
    expect(screen.getByText('1 of 2')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Add item' }));
    expect(screen.getAllByRole('textbox')).toHaveLength(2);
    expect(screen.getByLabelText('Tags 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Tags 2')).toBeInTheDocument();
    expect(screen.getByText('2 of 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add item' })).toBeDisabled();

    await userEvent.click(
        screen.getByRole('button', { name: 'Remove Tags 1' }),
    );
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    expect(screen.getAllByRole('textbox')[0]).toHaveValue('');
    expect(screen.getByLabelText('Tags 1')).toBeInTheDocument();
    expect(screen.getByText('1 of 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add item' })).toBeEnabled();
});

test('renders an array of objects as a list of nested-object groups', async () => {
    const schema = {
        type: 'object',
        properties: {
            contacts: {
                type: 'array',
                title: 'Contacts',
                items: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', title: 'Name' },
                        tags: {
                            type: 'object',
                            title: 'Tags',
                            additionalProperties: { type: 'string' },
                        },
                    },
                },
            },
        },
        examples: [
            {
                contacts: [
                    { name: 'Alice', tags: { a: 'first' } },
                    { name: 'Bob', tags: { b: 'second' } },
                    { name: 'Carol', tags: { c: 'third' } },
                ],
            },
        ],
    };

    render(<PayloadSchemaPreview schema={schema} />);

    await userEvent.click(
        screen.getAllByRole('button', { name: /Remove Contacts/ })[1],
    );

    expect(
        screen
            .getAllByLabelText('Name')
            .map((el) => (el as HTMLInputElement).value),
    ).toEqual(['Alice', 'Carol']);
    expect(
        screen
            .getAllByLabelText('Key')
            .map((el) => (el as HTMLInputElement).value),
    ).toEqual(['a', 'c']);

    await userEvent.click(screen.getByRole('button', { name: 'Add item' }));
    await userEvent.type(
        screen.getAllByLabelText('Name').at(-1) as HTMLElement,
        'Dave',
    );

    expect(screen.getAllByLabelText('Name').at(-1)).toHaveValue('Dave');
});

test('renders a dictionary (additionalProperties) property as a list of key/value entries, with add/remove controls', async () => {
    const schema = {
        type: 'object',
        properties: {
            loggers: {
                type: 'object',
                title: 'Per-logger overrides',
                description: 'Keyed by logger name.',
                additionalProperties: {
                    type: 'string',
                    enum: ['trace', 'debug', 'info', 'warn', 'error', 'fatal'],
                },
            },
            tagSets: {
                type: 'object',
                title: 'Tag sets',
                additionalProperties: {
                    type: 'array',
                    items: { type: 'string' },
                },
            },
        },
        examples: [
            {
                loggers: { api: 'debug' },
                tagSets: { x: ['p'], y: ['q'], z: ['r'] },
            },
        ],
    };

    render(<PayloadSchemaPreview schema={schema} />);

    const loggers = within(
        screen.getByRole('group', { name: 'Per-logger overrides' }),
    );
    expect(loggers.getByLabelText('Key')).toHaveValue('api');
    expect(loggers.getByLabelText('Value')).toHaveTextContent('debug');

    await userEvent.click(loggers.getByRole('button', { name: 'Add entry' }));
    expect(loggers.getAllByLabelText('Key')).toHaveLength(2);

    await userEvent.type(loggers.getAllByLabelText('Key')[1], 'db');
    expect(loggers.getAllByLabelText('Key')[1]).toHaveValue('db');

    await userEvent.click(
        loggers.getByRole('button', { name: 'Remove Per-logger overrides 1' }),
    );
    expect(loggers.getAllByLabelText('Key')).toHaveLength(1);
    expect(loggers.getByLabelText('Key')).toHaveValue('db');

    const tagSets = within(screen.getByRole('group', { name: 'Tag sets' }));
    await userEvent.click(
        tagSets.getAllByRole('button', { name: /Remove Tag sets/ })[1],
    );

    expect(
        tagSets
            .getAllByLabelText('Key')
            .map((el) => (el as HTMLInputElement).value),
    ).toEqual(['x', 'z']);
    expect(
        tagSets
            .getAllByLabelText('Value 1')
            .map((el) => (el as HTMLInputElement).value),
    ).toEqual(['p', 'r']);
});

test('disables adding a dictionary entry once maxProperties is reached, and re-enables it after removing one', async () => {
    const schema = {
        type: 'object',
        properties: {
            loggers: {
                type: 'object',
                title: 'Loggers',
                additionalProperties: { type: 'string' },
                maxProperties: 1,
            },
        },
        examples: [{ loggers: { api: 'debug' } }],
    };

    render(<PayloadSchemaPreview schema={schema} />);

    expect(screen.getByText('1 of 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add entry' })).toBeDisabled();

    await userEvent.click(
        screen.getByRole('button', { name: 'Remove Loggers 1' }),
    );
    expect(screen.getByText('0 of 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add entry' })).toBeEnabled();
});

test('falls back to "not supported" for a tuple-form array (items as a list of positional schemas)', () => {
    const schema = {
        type: 'object',
        properties: {
            coordinate: {
                type: 'array',
                title: 'Coordinate',
                items: [
                    { type: 'number', title: 'Latitude' },
                    { type: 'number', title: 'Longitude' },
                ],
            },
        },
        examples: [{ coordinate: [59.9, 10.7] }],
    };

    render(<PayloadSchemaPreview schema={schema} />);

    expect(
        screen.getByText(/not supported in a form view/),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Latitude')).not.toBeInTheDocument();
});

test('renders a checkbox for a boolean property', async () => {
    const schema = {
        type: 'object',
        properties: {
            enabled: {
                type: 'boolean',
                title: 'Enabled',
                description: 'Whether this feature is turned on.',
            },
        },
        examples: [{ enabled: true }],
    };

    render(<PayloadSchemaPreview schema={schema} />);

    const enabled = screen.getByLabelText('Enabled');
    expect(enabled).toMatchObject({ checked: true, disabled: false });
    expect(
        screen.getByText('Whether this feature is turned on.'),
    ).toBeInTheDocument();

    await userEvent.click(enabled);
    expect(enabled).not.toBeChecked();
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

test('shows a placeholder when the schema is not an object yet', () => {
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
