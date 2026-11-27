import { expect, test } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { render } from 'utils/testRenderer';
import { testServerRoute, testServerSetup } from 'utils/testServer';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import type { StrategyVariantSchema } from 'openapi';
import { SuggestPayloadSchema } from './SuggestPayloadSchema.tsx';

const server = testServerSetup();

const variant = (
    name: string,
    payload?: StrategyVariantSchema['payload'],
): StrategyVariantSchema => ({
    name,
    weight: 500,
    weightType: 'variable',
    stickiness: 'default',
    payload,
});

const jsonPayload = { type: 'json', value: '{}' } as const;

test('JSON payload variants are suggested a schema built from them, only to users who can update the flag, confirming before leaving the form', async () => {
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: { current: { enterprise: 'version' } },
        flags: { payloadSchemas: true },
    });
    render(
        <>
            <SuggestPayloadSchema
                projectId='default'
                variants={[
                    variant('blue', jsonPayload),
                    variant('plain'),
                    variant('green', jsonPayload),
                ]}
                createSchemaPath='/create-schema'
            />
            <SuggestPayloadSchema
                projectId='other'
                variants={[variant('red', jsonPayload)]}
                createSchemaPath='/other-schema'
            />
        </>,
        { permissions: [{ permission: UPDATE_FEATURE, project: 'default' }] },
    );

    expect(
        await screen.findByText(
            'blue, green use JSON payloads without validation.',
        ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/^red /)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Create schema' }));
    fireEvent.click(
        within(await screen.findByRole('dialog')).getByRole('button', {
            name: "Yes, I'm sure",
        }),
    );

    expect(window.location.pathname).toBe('/create-schema');
});
