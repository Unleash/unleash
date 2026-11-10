import { useState } from 'react';
import { screen } from '@testing-library/react';
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
