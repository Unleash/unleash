import { createUuid } from 'utils/createUuid';
import { VariantForm } from '../FeatureView/FeatureVariants/FeatureEnvironmentVariants/EnvironmentVariantsModal/VariantForm/VariantForm.tsx';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import type { IFeatureVariantEdit } from '../FeatureView/FeatureVariants/FeatureEnvironmentVariants/EnvironmentVariantsModal/EnvironmentVariantsModal.tsx';
import { WeightType } from '../../../constants/variantTypes.ts';
import { styled, useTheme, Button, Tabs } from '@mui/material';
import type { StrategyFormState } from 'interfaces/strategy';
import { useEventTracker } from 'hooks/useEventTracker';
import Add from '@mui/icons-material/Add';
import { VariantPill } from './VariantPill/VariantPill.tsx';
import { VariantsWeightBar } from './VariantsWeightBar/VariantsWeightBar.tsx';
import { absorbWeightChange, splitWeightsEvenly } from './variantWeights.ts';

const EmptyStateDescription = styled('p')(({ theme }) => ({
    marginBottom: theme.spacing(2),
    color: theme.palette.text.secondary,
}));

const PillRow = styled('div')(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
}));

interface StrategyVariantsProps<T extends StrategyFormState> {
    setStrategy: React.Dispatch<React.SetStateAction<T>>;
    strategy: T;
    canRenamePreexistingVariants?: boolean;
}

export const StrategyVariants = <T extends StrategyFormState>({
    strategy,
    setStrategy,
    canRenamePreexistingVariants,
}: StrategyVariantsProps<T>) => {
    const { trackEvent } = useEventTracker();
    const initialVariants = (strategy.variants || []).map((variant) => ({
        ...variant,
        new: canRenamePreexistingVariants || false,
        isValid: true,
        id: createUuid(),
        overrides: [],
    }));
    const [variantsEdit, setVariantsEdit] =
        useState<IFeatureVariantEdit[]>(initialVariants);
    const [selectedVariantId, setSelectedVariantId] = useState(
        initialVariants[0]?.id,
    );
    const pillListRef = useRef<HTMLDivElement>(null);
    const focusSelectedPillAfterRender = useRef(false);

    useEffect(() => {
        if (!focusSelectedPillAfterRender.current) return;
        focusSelectedPillAfterRender.current = false;
        pillListRef.current
            ?.querySelector<HTMLElement>('[aria-selected="true"]')
            ?.focus();
    });
    const theme = useTheme();

    const stickiness =
        strategy?.parameters && 'stickiness' in strategy?.parameters
            ? String(strategy.parameters.stickiness)
            : 'default';

    // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on the serialized variants on purpose; variantsEdit is a new array on every edit and setStrategy is a stable setter
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

    // biome-ignore lint/correctness/useExhaustiveDependencies: keyed on stickiness and the serialized variants on purpose; variantsEdit is a new array on every edit and setStrategy is a stable setter
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
            prevVariants.map((prevVariant) =>
                prevVariant.id === id
                    ? { ...updatedVariant, weight: prevVariant.weight }
                    : prevVariant,
            ),
        );
    };

    const changeVariantWeight = (weight: number, id: string) => {
        setVariantsEdit((prevVariants) => {
            const changedIndex = prevVariants.findIndex(
                (variant) => variant.id === id,
            );
            const lockedIndexes = prevVariants.flatMap((variant, index) =>
                variant.weightType === WeightType.FIX ? [index] : [],
            );
            const nextWeights = absorbWeightChange({
                weights: prevVariants.map((variant, index) =>
                    index === changedIndex ? weight : variant.weight,
                ),
                changedIndex,
                lockedIndexes,
            });
            return prevVariants.map((variant, index) => ({
                ...variant,
                weight: nextWeights[index],
            }));
        });
    };

    const addVariant = () => {
        const id = createUuid();
        setVariantsEdit((variantsEdit) =>
            splitWeightsEvenly([
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
            ]),
        );
        setSelectedVariantId(id);
        focusSelectedPillAfterRender.current = true;
        trackEvent('strategy-variants', {
            props: {
                eventType: 'variant added',
            },
        });
    };

    const changeWeights = (weights: number[]) =>
        setVariantsEdit((prevVariants) =>
            prevVariants.map((variant, index) => ({
                ...variant,
                weight: weights[index],
            })),
        );

    const removeVariant = (id: string) => {
        const removedIndex = variantsEdit.findIndex(
            (variant) => variant.id === id,
        );
        const remaining = variantsEdit.filter((variant) => variant.id !== id);
        setVariantsEdit(splitWeightsEvenly(remaining));
        setSelectedVariantId(remaining[Math.max(removedIndex - 1, 0)]?.id);
        focusSelectedPillAfterRender.current = true;
    };

    const variantWeightsError =
        variantsEdit.reduce(
            (acc, variant) => acc + (variant.weight || 0),
            0,
        ) !== 1000;

    if (variantsEdit.length === 0) {
        return (
            <>
                <EmptyStateDescription>
                    Everyone gets the same experience by default. Add one
                    variant to send a payload. Add multiple to run an
                    experiment.
                </EmptyStateDescription>
                <Button
                    onClick={addVariant}
                    startIcon={<Add />}
                    variant='outlined'
                    size='medium'
                    data-testid='ADD_STRATEGY_VARIANT_BUTTON'
                >
                    Add variant
                </Button>
            </>
        );
    }

    const variantColor = (index: number) =>
        theme.palette.variants[index % theme.palette.variants.length];
    const selectedVariant =
        variantsEdit.find((variant) => variant.id === selectedVariantId) ??
        variantsEdit[0];
    const selectedIndex = variantsEdit.indexOf(selectedVariant);

    return (
        <>
            <VariantsWeightBar
                variants={variantsEdit.map((variant, index) => ({
                    id: variant.id,
                    name: variant.name,
                    weight: variant.weight,
                    color: variantColor(index),
                    locked: variant.weightType === WeightType.FIX,
                }))}
                weightsError={variantWeightsError}
                onWeightsChange={changeWeights}
            />
            <PillRow>
                <Tabs
                    ref={pillListRef}
                    value={selectedVariant.id}
                    onChange={(_, id: string) => setSelectedVariantId(id)}
                    selectionFollowsFocus
                    aria-label='Variants'
                    sx={{ minHeight: 0, overflow: 'visible' }}
                    slotProps={{
                        indicator: { sx: { display: 'none' } },
                        scroller: { style: { overflow: 'visible' } },
                        list: { sx: { flexWrap: 'wrap', gap: 1 } },
                    }}
                >
                    {variantsEdit.map((variant, index) => (
                        <VariantPill
                            key={variant.id}
                            value={variant.id}
                            name={variant.name}
                            weight={variant.weight}
                            payload={variant.payload}
                            color={variantColor(index)}
                            locked={variant.weightType === WeightType.FIX}
                        />
                    ))}
                </Tabs>
                <Button
                    onClick={addVariant}
                    variant='text'
                    size='small'
                    startIcon={<Add />}
                    data-testid='ADD_STRATEGY_VARIANT_BUTTON'
                >
                    Add variant
                </Button>
            </PillRow>

            <VariantForm
                key={selectedVariant.id}
                variant={selectedVariant}
                variants={variantsEdit}
                changeWeight={(weight) =>
                    changeVariantWeight(weight, selectedVariant.id)
                }
                updateVariant={(updatedVariant) =>
                    updateVariant(updatedVariant, selectedVariant.id)
                }
                removeVariant={() => removeVariant(selectedVariant.id)}
                decorationColor={variantColor(selectedIndex)}
                weightsError={variantWeightsError}
            />
        </>
    );
};
