import { useState } from 'react';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import { render } from 'utils/testRenderer';
import { SchemaForm } from './SchemaForm.tsx';

const schema = {
    type: 'object',
    properties: {
        email: { type: 'string', title: 'Email' },
        name: { type: 'string', title: 'Name' },
        address: {
            type: 'object',
            title: 'Address',
            properties: {
                city: { type: 'string', title: 'City' },
                zip: { type: 'string', title: 'Zip' },
            },
        },
    },
};

const StatefulSchemaForm = () => {
    const [value, setValue] = useState<Record<string, unknown>>({
        email: 'ada@example.com',
        address: { city: 'Oslo' },
    });

    return <SchemaForm schema={schema} value={value} onChange={setValue} />;
};

test('editing one field keeps the value of every other field, including fields nested in an object group', async () => {
    render(<StatefulSchemaForm />);

    await userEvent.type(screen.getByLabelText('Name'), 'Ada');
    await userEvent.type(screen.getByLabelText('Zip'), '0150');

    expect(screen.getByLabelText('Email')).toHaveValue('ada@example.com');
    expect(screen.getByLabelText('Name')).toHaveValue('Ada');
    expect(screen.getByLabelText('City')).toHaveValue('Oslo');
    expect(screen.getByLabelText('Zip')).toHaveValue('0150');
});

const nullableSchema = {
    type: 'object',
    required: ['region'],
    properties: {
        until: {
            type: ['string', 'null'],
            title: 'Until',
            format: 'date-time',
        },
        contact: { type: 'string', title: 'Contact', format: 'email' },
        note: { type: 'string', title: 'Note' },
        size: { type: 'string', title: 'Size', enum: ['', 's'] },
        region: {
            type: ['string', 'null'],
            title: 'Region',
            enum: ['eu', 'us', null],
        },
    },
};

const StatefulNullableSchemaForm = ({
    onSave,
}: {
    onSave: (value: Record<string, unknown>) => void;
}) => {
    const [value, setValue] = useState<Record<string, unknown>>({
        until: '2026-10-09T02:00:00.000Z',
        contact: 'ada@example.com',
        note: 'hi',
        size: 's',
        region: 'eu',
    });

    return (
        <SchemaForm
            schema={nullableSchema}
            value={value}
            onChange={(next) => {
                setValue(next);
                onSave(next);
            }}
        />
    );
};

test('clearing a field stores an empty string where the schema accepts one, null where it allows null, and leaves any other field out', async () => {
    let saved: Record<string, unknown> = {};
    render(
        <StatefulNullableSchemaForm
            onSave={(value) => {
                saved = value;
            }}
        />,
    );

    fireEvent.change(screen.getByLabelText('Until'), { target: { value: '' } });
    await userEvent.clear(screen.getByLabelText('Contact'));
    await userEvent.clear(screen.getByLabelText('Note'));
    await userEvent.click(screen.getByLabelText('Size'));
    await userEvent.click(screen.getByRole('option', { name: 'None' }));
    await userEvent.click(screen.getByLabelText('Region'));
    expect(
        screen.queryByRole('option', { name: 'null' }),
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('option', { name: 'None' }));

    expect(saved).toEqual({
        until: null,
        note: '',
        size: '',
        region: null,
    });
    await userEvent.click(screen.getByLabelText('Region'));
    expect(screen.getByRole('option', { name: 'None' })).toHaveAttribute(
        'aria-selected',
        'true',
    );
});
