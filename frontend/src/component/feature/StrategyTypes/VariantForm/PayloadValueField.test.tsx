import { useState } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer.tsx';
import { expect, test } from 'vitest';
import type { IPayload } from 'interfaces/featureToggle.ts';
import { PayloadValueField } from './PayloadValueField.tsx';

const defaultProps = {
    id: 'variant-payload-value',
    onBlur: () => {},
};

const samplePayloadSchema = {
    type: 'object',
    properties: {
        cta: { type: 'string', title: 'CTA' },
    },
};

const StatefulPayloadValueField = ({
    initialPayload,
    ...props
}: {
    initialPayload: IPayload;
    payloadSchema?: typeof samplePayloadSchema;
}) => {
    const [payload, setPayload] = useState(initialPayload);
    return (
        <PayloadValueField
            {...defaultProps}
            {...props}
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

test('shows the form/JSON toggle only when a schema is given and the payload is JSON', () => {
    const { rerender } = render(
        <PayloadValueField
            {...defaultProps}
            payloadSchema={samplePayloadSchema}
            value={{ type: 'json', value: '' }}
            onChange={() => {}}
        />,
    );
    expect(screen.getByRole('button', { name: 'Form' })).toBeInTheDocument();

    rerender(
        <PayloadValueField
            {...defaultProps}
            payloadSchema={samplePayloadSchema}
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
            value={{ type: 'json', value: '' }}
            onChange={() => {}}
        />,
    );
    expect(
        screen.queryByRole('button', { name: 'Form' }),
    ).not.toBeInTheDocument();
});

test('defaults to the schema form and preserves the value when toggling to JSON and back', async () => {
    render(
        <StatefulPayloadValueField
            payloadSchema={samplePayloadSchema}
            initialPayload={{ type: 'json', value: '' }}
        />,
    );

    await userEvent.type(screen.getByLabelText('CTA'), 'Start free trial');
    await userEvent.click(screen.getByRole('button', { name: 'JSON' }));

    expect(screen.queryByLabelText('CTA')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Form' }));

    expect(screen.getByLabelText('CTA')).toHaveValue('Start free trial');
});

test('disables switching to the form view when the current JSON is invalid', () => {
    render(
        <PayloadValueField
            {...defaultProps}
            payloadSchema={samplePayloadSchema}
            value={{ type: 'json', value: '{not valid' }}
            onChange={() => {}}
        />,
    );

    expect(screen.getByRole('button', { name: 'Form' })).toBeDisabled();
});

test('shows the raw JSON editor for an existing payload that is valid JSON but not an object', () => {
    render(
        <PayloadValueField
            {...defaultProps}
            payloadSchema={samplePayloadSchema}
            value={{ type: 'json', value: '[1,2,3]' }}
            onChange={() => {}}
        />,
    );

    expect(screen.getByRole('button', { name: 'Form' })).toBeDisabled();
    expect(screen.queryByLabelText('CTA')).not.toBeInTheDocument();
});

test('shows the raw JSON editor instead of the toggle when no schema is given', () => {
    render(
        <PayloadValueField
            {...defaultProps}
            value={{ type: 'json', value: '{}' }}
            onChange={() => {}}
        />,
    );

    expect(
        screen.queryByRole('button', { name: 'Form' }),
    ).not.toBeInTheDocument();
});
