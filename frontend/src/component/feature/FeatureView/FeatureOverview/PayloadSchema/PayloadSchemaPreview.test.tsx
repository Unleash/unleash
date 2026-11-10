import { screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { render } from 'utils/testRenderer';
import { PayloadSchemaPreview } from './PayloadSchemaPreview.tsx';

test('renders every property as an input, in declaration order, with its description', () => {
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
                .getAllByText(/^(Email|Tier|Enabled|Color|Tags)$/)
                .map((el) => el.textContent),
        ),
    ];
    expect(labels).toEqual(['Email', 'Tier', 'Enabled', 'Color', 'Tags']);
    expect(screen.getByLabelText('Enabled')).toBeInTheDocument();
    expect(screen.getByLabelText('Color')).toBeInTheDocument();
    expect(screen.getByLabelText('Tags')).toBeInTheDocument();
    expect(
        screen.getByText('Billing tier for this account.'),
    ).toBeInTheDocument();
});

test('shows a placeholder instead of crashing when the schema is not an object yet', () => {
    render(<PayloadSchemaPreview schema={undefined} />);

    expect(screen.getByText(/write a valid json schema/i)).toBeInTheDocument();
});

test("initializes the preview with the schema's first example instance", () => {
    const schema = {
        type: 'object',
        examples: [{ name: 'Ada' }],
        properties: {
            name: { type: 'string', title: 'Name' },
        },
    };

    render(<PayloadSchemaPreview schema={schema} />);

    expect(screen.getByLabelText('Name')).toHaveValue('Ada');
});
