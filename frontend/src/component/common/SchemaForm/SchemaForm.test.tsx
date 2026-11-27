import { useState } from 'react';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import { render } from 'utils/testRenderer';
import { SchemaForm } from './SchemaForm.tsx';

const schema = {
    type: 'object',
    required: ['region'],
    properties: {
        name: { type: 'string', title: 'Name' },
        address: {
            type: 'object',
            title: 'Address',
            properties: {
                city: { type: 'string', title: 'City' },
                zip: { type: 'string', title: 'Zip' },
            },
        },
        count: { type: 'integer', title: 'Count' },
        until: { type: 'string', title: 'Until', format: 'date-time' },
        size: { type: 'string', title: 'Size', enum: ['', 's'] },
        region: {
            type: ['string', 'null'],
            title: 'Region',
            enum: ['eu', 'us', null],
        },
    },
};

const StatefulSchemaForm = ({
    onSave,
}: {
    onSave?: (value: unknown) => void;
}) => {
    const [value, setValue] = useState<unknown>({
        address: { city: 'Oslo' },
        size: 's',
        region: 'eu',
    });

    return (
        <SchemaForm
            schema={schema}
            value={value}
            onChange={(next) => {
                setValue(next);
                onSave?.(next);
            }}
        />
    );
};

test('editing one field keeps the value of every other field, including fields nested in an object group', async () => {
    render(<StatefulSchemaForm />);

    await userEvent.type(screen.getByLabelText('Name'), 'Ada');
    await userEvent.type(screen.getByLabelText('Zip'), '0150');

    expect(screen.getByLabelText('Name')).toHaveValue('Ada');
    expect(screen.getByLabelText('City')).toHaveValue('Oslo');
    expect(screen.getByLabelText('Zip')).toHaveValue('0150');
});

test('each field stores and shows its input as its schema declares, offering a single None option for an enum that can be empty or null', async () => {
    let saved: unknown;
    render(
        <StatefulSchemaForm
            onSave={(value) => {
                saved = value;
            }}
        />,
    );

    fireEvent.change(screen.getByLabelText('Count'), {
        target: { value: '42' },
    });
    fireEvent.change(screen.getByLabelText('Until'), {
        target: { value: '2026-10-09T04:00' },
    });
    await userEvent.click(screen.getByLabelText('Size'));
    await userEvent.click(screen.getByRole('option', { name: 'None' }));
    await userEvent.click(screen.getByLabelText('Region'));
    expect(
        screen.queryByRole('option', { name: 'null' }),
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('option', { name: 'None' }));

    expect(saved).toMatchObject({
        count: 42,
        until: '2026-10-09T04:00:00.000Z',
        size: '',
        region: null,
    });
    expect(screen.getByLabelText('Until')).toHaveValue('2026-10-09T04:00');
    await userEvent.click(screen.getByLabelText('Region'));
    expect(screen.getByRole('option', { name: 'None' })).toHaveAttribute(
        'aria-selected',
        'true',
    );
});

test('a root array schema is edited as a list of items', async () => {
    let saved: unknown;
    render(
        <SchemaForm
            schema={{ type: 'array', items: { type: 'string' } }}
            value={['eu']}
            onChange={(next) => {
                saved = next;
            }}
        />,
    );

    expect(screen.getByLabelText('Items 1')).toHaveValue('eu');
    await userEvent.click(screen.getByRole('button', { name: 'Add item' }));
    await userEvent.type(screen.getByLabelText('Items 2'), 'u');

    expect(saved).toEqual(['eu', 'u']);
});
