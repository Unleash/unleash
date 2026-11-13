import { type KeyboardEvent, memo, type PointerEvent, useRef } from 'react';
import type { IFeatureVariantEdit } from '../../FeatureView/FeatureVariants/FeatureEnvironmentVariants/EnvironmentVariantsModal/EnvironmentVariantsModal.tsx';
import { alpha, styled, Tooltip } from '@mui/material';
import DragIndicator from '@mui/icons-material/DragIndicator';
import { focusOutline } from 'themes/themeStyles';
import {
    FIXED_WEIGHT_EXPLANATION,
    splitPositionsFromWeights,
    TOTAL_WEIGHT,
    SLIDER_STEP,
    weightsAfterHandleDrag,
} from '../variantWeights.ts';
import { calculateVariantWeight } from 'component/common/util.ts';

const Bar = styled('div', {
    shouldForwardProp: (prop) => prop !== 'hasError',
})<{ hasError: boolean }>(({ theme, hasError }) => ({
    position: 'relative',
    height: theme.spacing(2),
    marginBottom: theme.spacing(2),
    userSelect: 'none',
    touchAction: 'none',
    borderRadius: theme.shape.borderRadius,
    outline: hasError ? `2px solid ${theme.palette.error.main}` : 'none',
    outlineOffset: 2,
}));

const Segments = styled('div')(({ theme }) => ({
    display: 'flex',
    height: '100%',
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
}));

const fixedWeightStripes = (color: string) =>
    `repeating-linear-gradient(135deg, ${color} 0, ${color} 4px, ${alpha(color, 0.5)} 4px, ${alpha(color, 0.5)} 8px)`;

const Segment = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    color: theme.palette.text.primary,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightBold,
}));

const HANDLE_WIDTH_PX = 24;

const Handle = styled('span')(({ theme }) => ({
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    borderRadius: '50%',
    width: HANDLE_WIDTH_PX,
    height: HANDLE_WIDTH_PX,
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[1],
    color: theme.palette.text.secondary,
    fontSize: theme.typography.caption.fontSize,
    cursor: 'col-resize',
    touchAction: 'none',
    '&:focus-visible': {
        ...focusOutline(theme),
        zIndex: 1,
    },
}));

type BarVariant = Pick<IFeatureVariantEdit, 'id' | 'name' | 'weight'> & {
    color: string;
    hasFixedWeight: boolean;
};

type VariantsWeightBarProps = {
    variants: BarVariant[];
    weightsError?: boolean;
    onWeightsChange: (weights: number[]) => void;
    onDragStart: (draggedHandleIndex: number) => void;
};

type HandleDrag = {
    handleIndex: number;
    pressClientX: number;
    pressSplitPosition: number;
    barWidth: number;
    started: boolean;
};

const VariantsWeightBarComponent = ({
    variants,
    weightsError = false,
    onWeightsChange,
    onDragStart,
}: VariantsWeightBarProps) => {
    const weights = variants.map((variant) => variant.weight);
    const splitPositions = splitPositionsFromWeights(weights);
    const barRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<HandleDrag | null>(null);

    const handleCount = splitPositions.length;
    const handlePixelOffsets = splitPositions.map(
        (splitPosition, handleIndex) => {
            const handleWidthsBeforeHandleCenter =
                (handleIndex + 0.5) * HANDLE_WIDTH_PX;
            const handleWidthsSpreadByWeight =
                (splitPosition / TOTAL_WEIGHT) * handleCount * HANDLE_WIDTH_PX;
            return handleWidthsBeforeHandleCenter - handleWidthsSpreadByWeight;
        },
    );

    const segmentBasePixels = (index: number) => {
        const halfHandleOnTheLeft = index > 0 ? HANDLE_WIDTH_PX / 2 : 0;
        const halfHandleOnTheRight =
            index < weights.length - 1 ? HANDLE_WIDTH_PX / 2 : 0;
        return halfHandleOnTheLeft + halfHandleOnTheRight;
    };

    const moveHandleTo = (
        handleIndex: number,
        targetPosition: number,
        notifyDragStart: () => void,
    ) => {
        const nextWeights = weightsAfterHandleDrag({
            previousWeights: weights,
            targetPosition,
            draggedHandleIndex: handleIndex,
        });
        const weightsChanged = nextWeights.some(
            (nextWeight, index) => nextWeight !== weights[index],
        );
        if (!weightsChanged) {
            return;
        }
        notifyDragStart();
        onWeightsChange(nextWeights);
    };

    const startHandleDrag =
        (handleIndex: number) => (event: PointerEvent<HTMLElement>) => {
            const barWidth = barRef.current?.getBoundingClientRect().width ?? 0;
            if (barWidth === 0) {
                return;
            }
            event.currentTarget.setPointerCapture(event.pointerId);
            dragRef.current = {
                handleIndex,
                pressClientX: event.clientX,
                pressSplitPosition: splitPositions[handleIndex],
                barWidth,
                started: false,
            };
        };

    const moveHandleDrag = (event: PointerEvent<HTMLElement>) => {
        const drag = dragRef.current;
        if (!drag) {
            return;
        }
        if (event.buttons === 0) {
            dragRef.current = null; // the press ended without us seeing it, so this is a hover, not a drag
            return;
        }
        const draggedWeight =
            ((event.clientX - drag.pressClientX) / drag.barWidth) *
            TOTAL_WEIGHT;
        moveHandleTo(
            drag.handleIndex,
            drag.pressSplitPosition + draggedWeight,
            () => {
                if (!drag.started) {
                    drag.started = true;
                    onDragStart(drag.handleIndex);
                }
            },
        );
    };

    const endHandleDrag = () => {
        dragRef.current = null;
    };

    const keyboardTargetPosition = (
        handleIndex: number,
        key: string,
    ): number | undefined => {
        const handlePosition = splitPositions[handleIndex];
        switch (key) {
            case 'Home':
                return handlePosition - weights[handleIndex];
            case 'End':
                return handlePosition + weights[handleIndex + 1];
            case 'PageUp':
                return handlePosition + 5 * SLIDER_STEP;
            case 'PageDown':
                return handlePosition - 5 * SLIDER_STEP;
            case 'ArrowLeft':
            case 'ArrowDown':
                return handlePosition - SLIDER_STEP;
            case 'ArrowRight':
            case 'ArrowUp':
                return handlePosition + SLIDER_STEP;
            default:
                return undefined;
        }
    };

    const nudgeHandleWithKeyboard =
        (handleIndex: number) => (event: KeyboardEvent<HTMLElement>) => {
            const targetPosition = keyboardTargetPosition(
                handleIndex,
                event.key,
            );
            if (targetPosition === undefined) {
                return;
            }
            event.preventDefault();
            moveHandleTo(handleIndex, targetPosition, () =>
                onDragStart(handleIndex),
            );
        };

    const variantName = (variant: BarVariant, variantIndex: number) =>
        variant.name || `Variant ${variantIndex + 1}, unnamed,`;

    const variantValueText = (variant: BarVariant) => {
        const fixedText = variant.hasFixedWeight ? ' (fixed)' : '';
        return `${calculateVariantWeight(variant.weight)}%${fixedText}`;
    };

    return (
        <Bar ref={barRef} hasError={weightsError}>
            <Segments>
                {variants.map((variant, index) => (
                    <Tooltip
                        key={variant.id}
                        title={
                            variant.hasFixedWeight
                                ? FIXED_WEIGHT_EXPLANATION
                                : ''
                        }
                        placement='top'
                        arrow
                    >
                        <Segment
                            style={{
                                flex: `${weights[index]} 0 ${segmentBasePixels(index)}px`,
                                background: variant.hasFixedWeight
                                    ? fixedWeightStripes(variant.color)
                                    : variant.color,
                            }}
                        >
                            {weights[index] / 10}%
                        </Segment>
                    </Tooltip>
                ))}
            </Segments>
            {variants.length > 1
                ? splitPositions.map((splitPosition, handleIndex) => {
                      const left = variants[handleIndex];
                      const right = variants[handleIndex + 1];
                      const leftName = variantName(left, handleIndex);
                      const rightName = variantName(right, handleIndex + 1);

                      return (
                          <Handle
                              key={variants[handleIndex].id}
                              role='slider'
                              tabIndex={0}
                              aria-orientation='horizontal'
                              aria-label={`Split between ${leftName} and ${rightName}`}
                              aria-valuemin={0}
                              aria-valuemax={calculateVariantWeight(
                                  left.weight + right.weight,
                              )}
                              aria-valuenow={calculateVariantWeight(
                                  left.weight,
                              )}
                              aria-valuetext={`${leftName}: ${variantValueText(left)}, ${rightName}: ${variantValueText(right)}`}
                              style={{
                                  left: `calc(${(splitPosition / TOTAL_WEIGHT) * 100}% + ${handlePixelOffsets[handleIndex]}px)`,
                              }}
                              onPointerDown={startHandleDrag(handleIndex)}
                              onPointerMove={moveHandleDrag}
                              onPointerUp={endHandleDrag}
                              onPointerCancel={endHandleDrag}
                              onLostPointerCapture={endHandleDrag}
                              onKeyDown={nudgeHandleWithKeyboard(handleIndex)}
                          >
                              <DragIndicator fontSize='inherit' />
                          </Handle>
                      );
                  })
                : null}
        </Bar>
    );
};

const barVariantsAreEqual = (previous: BarVariant[], next: BarVariant[]) =>
    previous.length === next.length &&
    previous.every((variant, index) => {
        const fields = Object.keys(variant) as (keyof BarVariant)[];
        return fields.every((field) => variant[field] === next[index][field]);
    });

export const VariantsWeightBar = memo(
    VariantsWeightBarComponent,
    (previousProps, nextProps) =>
        previousProps.weightsError === nextProps.weightsError &&
        previousProps.onWeightsChange === nextProps.onWeightsChange &&
        previousProps.onDragStart === nextProps.onDragStart &&
        barVariantsAreEqual(previousProps.variants, nextProps.variants),
);
