import { VariantForm } from '../FeatureView/FeatureVariants/FeatureEnvironmentVariants/EnvironmentVariantsModal/VariantForm/VariantForm';
import { updateWeightEdit } from '../../common/util';
import React, { FC, useEffect, useState } from 'react';
import { IFeatureVariantEdit } from '../FeatureView/FeatureVariants/FeatureEnvironmentVariants/EnvironmentVariantsModal/EnvironmentVariantsModal';
import PermissionButton from '../../common/PermissionButton/PermissionButton';
import { UPDATE_FEATURE_ENVIRONMENT_VARIANTS } from '../../providers/AccessProvider/permissions';
import { v4 as uuidv4 } from 'uuid';
import { WeightType } from '../../../constants/variantTypes';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useDefaultProjectSettings } from 'hooks/useDefaultProjectSettings';
import { styled } from '@mui/material';
import { useRequiredQueryParam } from 'hooks/useRequiredQueryParam';
import { IFeatureStrategy } from 'interfaces/strategy';

const StyledVariantForms = styled('div')({
    display: 'flex',
    flexDirection: 'column',
});

export const StrategyVariants: FC<{
    setStrategy: React.Dispatch<
        React.SetStateAction<Partial<IFeatureStrategy>>
    >;
    strategy: Partial<IFeatureStrategy>;
}> = ({ strategy, setStrategy }) => {
    const projectId = useRequiredPathParam('projectId');
    const environment = useRequiredQueryParam('environmentId');
    const [variantsEdit, setVariantsEdit] = useState<IFeatureVariantEdit[]>([]);
    const [newVariant, setNewVariant] = useState<string>();
    const { defaultStickiness, loading } = useDefaultProjectSettings(projectId);

    useEffect(() => {
        setVariantsEdit(
            (strategy.variants || []).map(variant => ({
                ...variant,
                new: false,
                isValid: true,
                id: uuidv4(),
                overrides: [],
            }))
        );
    }, []);

    useEffect(() => {
        setStrategy(prev => ({
            ...prev,
            variants: variantsEdit.map(variant => ({
                name: variant.name,
                weight: variant.weight,
                stickiness: variant.stickiness,
                payload: variant.payload,
                weightType: variant.weightType,
            })),
        }));
    }, [JSON.stringify(variantsEdit)]);

    const updateVariant = (updatedVariant: IFeatureVariantEdit, id: string) => {
        setVariantsEdit(prevVariants =>
            updateWeightEdit(
                prevVariants.map(prevVariant =>
                    prevVariant.id === id ? updatedVariant : prevVariant
                ),
                1000
            )
        );
    };

    const addVariant = () => {
        const id = uuidv4();
        setVariantsEdit(variantsEdit => [
            ...variantsEdit,
            {
                name: '',
                weightType: WeightType.VARIABLE,
                weight: 0,
                overrides: [],
                stickiness:
                    variantsEdit?.length > 0
                        ? variantsEdit[0].stickiness
                        : defaultStickiness,
                new: true,
                isValid: false,
                id,
            },
        ]);
        setNewVariant(id);
    };

    return (
        <>
            <StyledVariantForms>
                {variantsEdit.map(variant => (
                    <VariantForm
                        key={variant.id}
                        variant={variant}
                        variants={variantsEdit}
                        updateVariant={updatedVariant =>
                            updateVariant(updatedVariant, variant.id)
                        }
                        removeVariant={() =>
                            setVariantsEdit(variantsEdit =>
                                updateWeightEdit(
                                    variantsEdit.filter(
                                        v => v.id !== variant.id
                                    ),
                                    1000
                                )
                            )
                        }
                    />
                ))}
            </StyledVariantForms>
            <PermissionButton
                onClick={addVariant}
                variant="outlined"
                permission={UPDATE_FEATURE_ENVIRONMENT_VARIANTS}
                projectId={projectId}
                environmentId={environment}
            >
                Add variant
            </PermissionButton>
        </>
    );
};
