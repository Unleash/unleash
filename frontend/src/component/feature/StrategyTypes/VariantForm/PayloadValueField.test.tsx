import { useState } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer.tsx';
import { expect, test } from 'vitest';
import type { IPayload } from 'interfaces/featureToggle.ts';
import { PayloadValueField } from './PayloadValueField.tsx';

const defaultProps = {
    schemaActive: false,
    id: 'variant-payload-value',
    onBlur: () => {},
};

const StatefulPayloadValueField = ({
    initialPayload,
}: {
    initialPayload: IPayload;
}) => {
    const [payload, setPayload] = useState(initialPayload);
    return (
        <PayloadValueField
            {...defaultProps}
            value={payload}
            onChange={setPayload}
        />
    );
};

test('preserves line breaks typed into a string payload', async () => {
    render(
        <StatefulPayloadValueField
            initialPayload={{ type: 'string', value: '' }}
        />,
    );

    await userEvent.type(
        screen.getByRole('textbox', { name: 'Value' }),
        'first line{Enter}second line',
    );

    expect(screen.getByRole('textbox', { name: 'Value' })).toHaveValue(
        'first line\nsecond line',
    );
});

test('shows the form/JSON toggle only when the schema is active and the payload is JSON', () => {
    const { rerender } = render(
        <PayloadValueField
            {...defaultProps}
            schemaActive
            value={{ type: 'json', value: '' }}
            onChange={() => {}}
        />,
    );
    expect(screen.getByRole('button', { name: 'Form' })).toBeInTheDocument();

    rerender(
        <PayloadValueField
            {...defaultProps}
            schemaActive
            value={{ type: 'string', value: '' }}
            onChange={() => {}}
        />,
    );
    expect(
        screen.queryByRole('button', { name: 'Form' }),
    ).not.toBeInTheDocument();

    rerender(
        <PayloadValueField
            {...defaultProps}
            schemaActive={false}
            value={{ type: 'json', value: '' }}
            onChange={() => {}}
        />,
    );
    expect(
        screen.queryByRole('button', { name: 'Form' }),
    ).not.toBeInTheDocument();
});

test('defaults to the form placeholder when the schema is active, until switched to JSON', async () => {
    render(
        <PayloadValueField
            {...defaultProps}
            schemaActive
            value={{ type: 'json', value: '' }}
            onChange={() => {}}
        />,
    );

    expect(
        screen.getByText('Schema-based form — coming soon.'),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'JSON' }));

    expect(
        screen.queryByText('Schema-based form — coming soon.'),
    ).not.toBeInTheDocument();
});
