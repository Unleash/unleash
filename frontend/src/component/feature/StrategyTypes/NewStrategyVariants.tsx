import { VariantForm } from '../FeatureView/FeatureVariants/FeatureEnvironmentVariants/EnvironmentVariantsModal/VariantForm/VariantForm.tsx';
import { updateWeightEdit } from 'component/common/util';
import type React from 'react';
import { useEffect, useState } from 'react';
import type { IFeatureVariantEdit } from '../FeatureView/FeatureVariants/FeatureEnvironmentVariants/EnvironmentVariantsModal/EnvironmentVariantsModal.tsx';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import { UPDATE_FEATURE_ENVIRONMENT_VARIANTS } from '../../providers/AccessProvider/permissions.ts';
import { WeightType } from '../../../constants/variantTypes.ts';
import { Box, styled, Typography, useTheme, Alert } from '@mui/material';
import type { StrategyFormState } from 'interfaces/strategy';
import { VariantsSplitPreview } from 'component/common/VariantsSplitPreview/VariantsSplitPreview';
import { HelpIcon } from 'component/common/HelpIcon/HelpIcon';
import { StrategyVariantsUpgradeAlert } from 'component/common/StrategyVariantsUpgradeAlert/StrategyVariantsUpgradeAlert';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import Add from '@mui/icons-material/Add';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';

const StyledVariantForms = styled('div')({
    display: 'flex',
    flexDirection: 'column',
});

const StyledHelpIconBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
}));

interface NewStrategyVariantsProps<T extends StrategyFormState> {
    setStrategy: React.Dispatch<React.SetStateAction<T>>;
    strategy: T;
    projectId: string;
    environment: string;
    editable?: boolean;
}

export const NewStrategyVariants = <T extends StrategyFormState>({
    strategy,
    setStrategy,
    projectId,
    environment,
    editable,
}: NewStrategyVariantsProps<T>) => {
    const { trackEvent } = usePlausibleTracker();
    const initialVariants = (strategy.variants || []).map((variant) => ({
        ...variant,
        new: editable || false,
        isValid: true,
        id: crypto.randomUUID(),
        overrides: [],
    }));
    const [variantsEdit, setVariantsEdit] =
        useState<IFeatureVariantEdit[]>(initialVariants);
    const theme = useTheme();

    const stickiness =
        strategy?.parameters && 'stickiness' in strategy?.parameters
            ? String(strategy.parameters.stickiness)
            : 'default';

    useEffect(() => {
        return () => {
            setStrategy((prev: T) => ({
                ...prev,
                variants: variantsEdit.filter((variant) =>
                    Boolean(variant.name),
                ),
            }));
        };
    }, [JSON.stringify(variantsEdit)]);

    useEffect(() => {
        setStrategy((prev: T) => ({
            ...prev,
            variants: variantsEdit.map((variant) => ({
                stickiness,
                name: variant.name,
                weight: variant.weight,
                payload: variant.payload,
                weightType: variant.weightType,
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

    const variantWeightsError =
        variantsEdit.reduce(
            (acc, variant) => acc + (variant.weight || 0),
            0,
        ) !== 1000;

    return (
        <>
            <Alert severity='info' icon={false}>
                Variants enhance a feature flag by providing a version of the
                feature to be enabled
            </Alert>
            <StyledHelpIconBox>
                <Typography>Variants</Typography>
                <HelpIcon
                    htmlTooltip
                    tooltip={
                        <Box>
                            <Typography variant='body2'>
                                Variants in feature flagging allow you to serve
                                different versions of a feature to different
                                users. This can be used for A/B testing, gradual
                                rollouts, and canary releases. Variants provide
                                a way to control the user experience at a
                                granular level, enabling you to test and
                                optimize different aspects of your features.
                                Read more about variants{' '}
                                <a
                                    href='https://docs.getunleash.io/concepts/strategy-variants'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                >
                                    here
                                </a>
                            </Typography>
                        </Box>
                    }
                />
            </StyledHelpIconBox>
            <StyledVariantForms>
                <ConditionallyRender
                    condition={variantsEdit.length > 0}
                    show={<StrategyVariantsUpgradeAlert />}
                />

                {variantsEdit.map((variant, i) => (
                    <VariantForm
                        disableOverrides={true}
                        key={variant.id}
                        variant={variant}
                        variants={variantsEdit}
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
                        weightsError={variantWeightsError}
                    />
                ))}
            </StyledVariantForms>
            <PermissionButton
                onClick={addVariant}
                variant='outlined'
                permission={UPDATE_FEATURE_ENVIRONMENT_VARIANTS}
                projectId={projectId}
                environmentId={environment}
                data-testid='ADD_STRATEGY_VARIANT_BUTTON'
                startIcon={<Add />}
            >
                Add variant
            </PermissionButton>
            <VariantsSplitPreview
                variants={variantsEdit}
                weightsError={variantWeightsError}
            />
        </>
    );
};
