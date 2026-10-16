import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from 'utils/testRenderer';
import { expect, test } from 'vitest';
import { WeightType } from 'constants/variantTypes';
import type { IFeatureVariantEdit } from '../EnvironmentVariantsModal.tsx';
import { VariantForm } from './VariantForm.tsx';

const defaultVariant: IFeatureVariantEdit = {
    id: 'default',
    name: 'default',
    weight: 1000,
    weightType: WeightType.VARIABLE,
    stickiness: 'default',
    new: true,
    isValid: true,
};

test('keeps line breaks typed into a string payload', async () => {
    let updatedVariant: IFeatureVariantEdit | undefined;
    render(
        <VariantForm
            variant={defaultVariant}
            variants={[defaultVariant]}
            updateVariant={(updated) => {
                updatedVariant = updated;
            }}
            removeVariant={() => {}}
        />,
    );

    await userEvent.type(
        screen.getByRole('textbox', { name: 'Value' }),
        'first line{Enter}second line',
    );

    expect(updatedVariant?.payload).toEqual({
        type: 'string',
        value: 'first line\nsecond line',
    });
});
