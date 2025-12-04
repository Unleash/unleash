import type { IReleasePlanMilestoneStrategy } from 'interfaces/releasePlans';
import { useEffect, useState } from 'react';
import { Box, styled, Typography, Button, Alert } from '@mui/material';
import { HelpIcon } from '../../../../common/HelpIcon/HelpIcon.tsx';
import { StrategyVariantsUpgradeAlert } from 'component/common/StrategyVariantsUpgradeAlert/StrategyVariantsUpgradeAlert';
import { VariantForm } from 'component/feature/FeatureView/FeatureVariants/FeatureEnvironmentVariants/EnvironmentVariantsModal/VariantForm/VariantForm';
import type { IFeatureVariantEdit } from 'component/feature/FeatureView/FeatureVariants/FeatureEnvironmentVariants/EnvironmentVariantsModal/EnvironmentVariantsModal';
import { updateWeightEdit } from 'component/common/util';
import { WeightType } from 'constants/variantTypes';
import { useTheme } from '@mui/material';
import Add from '@mui/icons-material/Add';
import { VariantsSplitPreview } from 'component/common/VariantsSplitPreview/VariantsSplitPreview';

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

interface IMilestoneStrategyVariantsProps {
    strategy: Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>;
    setStrategy: React.Dispatch<
        React.SetStateAction<Omit<IReleasePlanMilestoneStrategy, 'milestoneId'>>
    >;
}

export const MilestoneStrategyVariants = ({
    strategy,
    setStrategy,
}: IMilestoneStrategyVariantsProps) => {
    const initialVariants = (strategy.variants || []).map((variant) => ({
        ...variant,
        new: true,
        isValid: true,
        id: crypto.randomUUID(),
        overrides: [],
    }));
    const [variantsEdit, setVariantsEdit] =
        useState<IFeatureVariantEdit[]>(initialVariants);

    const stickiness =
        strategy?.parameters && 'stickiness' in strategy?.parameters
            ? String(strategy.parameters.stickiness)
            : 'default';
    const theme = useTheme();

    useEffect(() => {
        return () => {
            setStrategy((prev) => ({
                ...prev,
                variants: variantsEdit.filter((variant) =>
                    Boolean(variant.name),
                ),
            }));
        };
    }, [JSON.stringify(variantsEdit)]);

    useEffect(() => {
        setStrategy((prev) => ({
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
                                Variants in feature toggling allow you to serve
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
                {variantsEdit.length > 0 && <StrategyVariantsUpgradeAlert />}

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
            <Button onClick={addVariant} variant='outlined' startIcon={<Add />}>
                Add variant
            </Button>
            <VariantsSplitPreview
                variants={variantsEdit}
                weightsError={variantWeightsError}
            />
        </>
    );
};
