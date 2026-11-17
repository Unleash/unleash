import type { ComponentProps } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer.tsx';
import { testServerRoute, testServerSetup } from 'utils/testServer.ts';
import { expect, test } from 'vitest';
import { WeightType } from 'constants/variantTypes.ts';
import type { IFeatureVariantEdit } from 'component/feature/variantEdit.ts';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig.ts';
import { VariantForm } from './VariantForm.tsx';

const server = testServerSetup();

const enablePayloadSchemas = () =>
    testServerRoute(server, '/api/admin/ui-config', {
        versionInfo: { current: { enterprise: 'version' } },
        flags: { payloadSchemas: true },
    });

const defaultVariant: IFeatureVariantEdit = {
    id: 'default',
    name: 'default',
    weight: 1000,
    weightType: WeightType.VARIABLE,
    stickiness: 'default',
    new: true,
    isValid: true,
};

const samplePayloadSchema = {
    type: 'object',
    properties: {
        cta: { type: 'string', title: 'CTA', default: 'Start free trial' },
    },
};

const GatedVariantForm = (props: ComponentProps<typeof VariantForm>) => {
    const { loading } = useUiConfig();
    return loading ? null : <VariantForm {...props} />;
};

test('includes the typed payload value in the variant update', async () => {
    let updatedVariant: IFeatureVariantEdit | undefined;
    render(
        <VariantForm
            variant={defaultVariant}
            variants={[defaultVariant]}
            updateVariant={(updated) => {
                updatedVariant = updated;
            }}
            changeWeight={() => {}}
            removeVariant={() => {}}
        />,
    );

    await userEvent.type(
        screen.getByRole('textbox', { name: 'Value' }),
        'hello',
    );

    expect(updatedVariant?.payload).toEqual({
        type: 'string',
        value: 'hello',
    });
});

test("initializes a new variant's JSON payload from the schema's default values", async () => {
    enablePayloadSchemas();
    let updatedVariant: IFeatureVariantEdit | undefined;
    render(
        <GatedVariantForm
            variant={defaultVariant}
            variants={[defaultVariant]}
            updateVariant={(updated) => {
                updatedVariant = updated;
            }}
            changeWeight={() => {}}
            removeVariant={() => {}}
            payloadSchema={samplePayloadSchema}
        />,
    );

    await screen.findByLabelText('CTA');
    expect(updatedVariant?.payload).toEqual({
        type: 'json',
        value: JSON.stringify({ cta: 'Start free trial' }, null, 2),
    });
});

test("keeps an existing variant's missing payload as a plain string when a payload schema is active", async () => {
    enablePayloadSchemas();
    const variant = { ...defaultVariant, new: false };
    let updatedVariant: IFeatureVariantEdit | undefined;
    render(
        <GatedVariantForm
            variant={variant}
            variants={[variant]}
            updateVariant={(updated) => {
                updatedVariant = updated;
            }}
            changeWeight={() => {}}
            removeVariant={() => {}}
            payloadSchema={samplePayloadSchema}
        />,
    );

    const valueInput = await screen.findByRole('textbox', { name: 'Value' });
    expect(screen.queryByLabelText('CTA')).not.toBeInTheDocument();

    await userEvent.type(valueInput, 'hello');

    expect(updatedVariant?.payload).toEqual({
        type: 'string',
        value: 'hello',
    });
});
