import { VariantForm } from '../FeatureView/FeatureVariants/FeatureEnvironmentVariants/EnvironmentVariantsModal/VariantForm/VariantForm';
import { updateWeightEdit } from '../../common/util';
import React, { FC, useEffect, useState } from 'react';
import { IFeatureVariantEdit } from '../FeatureView/FeatureVariants/FeatureEnvironmentVariants/EnvironmentVariantsModal/EnvironmentVariantsModal';
import PermissionButton from '../../common/PermissionButton/PermissionButton';
import { UPDATE_FEATURE_ENVIRONMENT_VARIANTS } from '../../providers/AccessProvider/permissions';
import { v4 as uuidv4 } from 'uuid';
import { WeightType } from '../../../constants/variantTypes';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { Link, styled, Typography, useTheme } from '@mui/material';
import { useRequiredQueryParam } from 'hooks/useRequiredQueryParam';
import { IFeatureStrategy } from 'interfaces/strategy';
import SplitPreviewSlider from './SplitPreviewSlider/SplitPreviewSlider';
import { HelpIcon } from '../../common/HelpIcon/HelpIcon';
import { StrategyVariantsUpgradeAlert } from '../../common/StrategyVariantsUpgradeAlert/StrategyVariantsUpgradeAlert';

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
    const theme = useTheme();
    const stickiness =
        strategy?.parameters && 'stickiness' in strategy?.parameters
            ? String(strategy.parameters.stickiness)
            : 'default';

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
                stickiness,
                name: variant.name,
                weight: variant.weight,
                payload: variant.payload,
                weightType: variant.weightType,
            })),
        }));
    }, [stickiness, JSON.stringify(variantsEdit)]);

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
                stickiness,
                new: true,
                isValid: false,
                id,
            },
        ]);
    };

    return (
        <>
            <Typography
                component="h3"
                sx={{ m: 0, display: 'flex', gap: '1ch' }}
                variant="h3"
            >
                Variants
                <HelpIcon
                    htmlTooltip={true}
                    tooltip={
                        <>
                            <span>
                                Variants allow to attach one or more values to
                                this strategy. Variants at the strategy level
                                override variants at the feature level.
                            </span>
                            <Link
                                target="_blank"
                                href="https://docs.getunleash.io/reference/feature-strategy-variants"
                            >
                                Learn more
                            </Link>
                        </>
                    }
                />
            </Typography>
            <StyledVariantForms>
                <StrategyVariantsUpgradeAlert />
                {variantsEdit.map((variant, i) => (
                    <VariantForm
                        disableOverrides={true}
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
                        decorationColor={
                            theme.palette.variants[
                                i % theme.palette.variants.length
                            ]
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
            <SplitPreviewSlider
                values={variantsEdit.map(variant => variant.weight / 10)}
            />
        </>
    );
};
