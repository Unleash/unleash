import { VariantForm } from '../FeatureView/FeatureVariants/FeatureEnvironmentVariants/EnvironmentVariantsModal/VariantForm/VariantForm.tsx';
import { updateWeightEdit } from 'component/common/util';
import type React from 'react';
import { useEffect, useState } from 'react';
import type { IFeatureVariantEdit } from '../FeatureView/FeatureVariants/FeatureEnvironmentVariants/EnvironmentVariantsModal/EnvironmentVariantsModal.tsx';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { UPDATE_FEATURE_ENVIRONMENT_VARIANTS } from '../../providers/AccessProvider/permissions.ts';
import { WeightType } from '../../../constants/variantTypes.ts';
import { Link, styled, Typography, useTheme } from '@mui/material';
import type { StrategyFormState } from 'interfaces/strategy';
import { VariantsSplitPreview } from 'component/common/VariantsSplitPreview/VariantsSplitPreview';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { StrategyVariantsUpgradeAlert } from 'component/common/StrategyVariantsUpgradeAlert/StrategyVariantsUpgradeAlert';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

const StyledVariantForms = styled('div')({
    display: 'flex',
    flexDirection: 'column',
});

interface StrategyVariantsProps<T extends StrategyFormState> {
    setStrategy: React.Dispatch<React.SetStateAction<T>>;
    strategy: T;
    projectId: string;
    environment: string;
    editable?: boolean;
    permission?: string | string[];
}

export const StrategyVariants = <T extends StrategyFormState>({
    strategy,
    setStrategy,
    projectId,
    environment,
    editable,
    permission = UPDATE_FEATURE_ENVIRONMENT_VARIANTS,
}: StrategyVariantsProps<T>) => {
    const { trackEvent } = usePlausibleTracker();
    const [variantsEdit, setVariantsEdit] = useState<IFeatureVariantEdit[]>([]);
    const theme = useTheme();

    const stickiness =
        strategy?.parameters && 'stickiness' in strategy?.parameters
            ? String(strategy.parameters.stickiness)
            : 'default';

    useEffect(() => {
        setVariantsEdit(
            (strategy.variants || []).map((variant) => ({
                ...variant,
                new: editable || false,
                isValid: true,
                id: crypto.randomUUID(),
                overrides: [],
            })),
        );
    }, []);

    useEffect(() => {
        setStrategy((prev: T) => ({
            ...prev,
            variants: variantsEdit.map((variant) => ({
                stickiness,
                name: variant.name,
                weight: variant.weight,
                payload: variant.payload,
                weightType: variant.weightType,
                jsonSchemaId: variant.jsonSchemaId,
            })),
        }));
    }, [stickiness, JSON.stringify(variantsEdit)]);

    const updateVariant = (updatedVariant: IFeatureVariantEdit, id: string) => {
        setVariantsEdit((prevVariants) =>
            updateWeightEdit(
                prevVariants.map((prevVariant) =>
                    prevVariant.id === id ? updatedVariant : prevVariant,
                ),
                1000,
            ),
        );
    };

    const addVariant = () => {
        const id = crypto.randomUUID();
        setVariantsEdit((variantsEdit) => [
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
        trackEvent('strategy-variants', {
            props: {
                eventType: 'variant added',
            },
        });
    };

    return (
        <>
            <Typography
                component='h3'
                sx={{ m: 0, display: 'flex', gap: '1ch' }}
                variant='h3'
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
                                target='_blank'
                                href='https://docs.getunleash.io/concepts/strategy-variants'
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
                        projectId={projectId}
                        updateVariant={(updatedVariant) =>
                            updateVariant(updatedVariant, variant.id)
                        }
                        removeVariant={() =>
                            setVariantsEdit((variantsEdit) =>
                                updateWeightEdit(
                                    variantsEdit.filter(
                                        (v) => v.id !== variant.id,
                                    ),
                                    1000,
                                ),
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
                variant='outlined'
                permission={permission}
                projectId={projectId}
                environmentId={environment}
                data-testid='ADD_STRATEGY_VARIANT_BUTTON'
            >
                Add variant
            </PermissionButton>
            <VariantsSplitPreview variants={variantsEdit} />
        </>
    );
};
