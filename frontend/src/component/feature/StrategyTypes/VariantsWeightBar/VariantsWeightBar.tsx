import { type HTMLAttributes, memo, type PointerEvent, useRef } from 'react';
import type { IFeatureVariantEdit } from '../../FeatureView/FeatureVariants/FeatureEnvironmentVariants/EnvironmentVariantsModal/EnvironmentVariantsModal.tsx';
import { alpha, Slider, styled } from '@mui/material';
import DragIndicator from '@mui/icons-material/DragIndicator';
import { focusOutline } from 'themes/themeStyles';
import {
    splitPositionsFromWeights,
    TOTAL_WEIGHT,
    weightsFromDraggedHandle,
} from '../variantWeights.ts';

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

const lockedStripes = (color: string) =>
    `repeating-linear-gradient(135deg, ${color} 0, ${color} 4px, ${alpha(color, 0.5)} 4px, ${alpha(color, 0.5)} 8px)`;

const Segment = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    minWidth: theme.spacing(0.5),
    color: theme.palette.text.primary,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightBold,
}));

const HandleSlider = styled(Slider)({
    position: 'absolute',
    inset: 0,
    height: '100%',
    padding: 0,
});

const Grip = styled('span')(({ theme }) => ({
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    borderRadius: '50%',
    width: theme.spacing(2),
    height: theme.spacing(2),
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[1],
    color: theme.palette.text.secondary,
    fontSize: theme.typography.caption.fontSize,
    cursor: 'col-resize',
    '&.Mui-focusVisible': focusOutline(theme),
}));

type GripThumbProps = HTMLAttributes<HTMLSpanElement> & {
    'data-index'?: number;
    hiddenHandleIndexes?: number[];
};

const GripThumb = ({
    children,
    hiddenHandleIndexes = [],
    ...thumbProps
}: GripThumbProps) => {
    const handleIsHidden = hiddenHandleIndexes.includes(
        thumbProps['data-index'] ?? -1,
    );
    if (handleIsHidden) {
        return null;
    }
    return (
        <Grip {...thumbProps}>
            {children}
            <DragIndicator fontSize='inherit' />
        </Grip>
    );
};

const ignorePressesOutsideHandles = (event: PointerEvent<HTMLElement>) => {
    const pressedHandle = (event.target as HTMLElement).closest('[data-index]'); // MUI attribute for each handle
    if (!pressedHandle) {
        event.preventDefault();
    }
};

type BarVariant = Pick<IFeatureVariantEdit, 'id' | 'name' | 'weight'> & {
    color: string;
    locked: boolean;
};

type VariantsWeightBarProps = {
    variants: BarVariant[];
    weightsError?: boolean;
    onWeightsChange: (weights: number[]) => void;
};

const VariantsWeightBarComponent = ({
    variants,
    weightsError = false,
    onWeightsChange,
}: VariantsWeightBarProps) => {
    const weights = variants.map((variant) => variant.weight);
    const splitPositions = splitPositionsFromWeights(weights);
    const draggedHandleIndexRef = useRef<number | null>(null);

    const hiddenHandleIndexes = splitPositions.flatMap((_, handleIndex) => {
        const variantLeftOfHandle = variants[handleIndex];
        const variantRightOfHandle = variants[handleIndex + 1];
        return variantLeftOfHandle.locked || variantRightOfHandle.locked
            ? [handleIndex]
            : [];
    });
    const changeSplitPositions = (
        value: number | number[],
        activeHandleIndex: number,
    ) => {
        const nextSplitPositions = Array.isArray(value) ? value : [value];
        const draggedHandleIndex =
            draggedHandleIndexRef.current ?? activeHandleIndex;
        draggedHandleIndexRef.current = draggedHandleIndex;
        const lockedIndexes = variants.flatMap((variant, index) =>
            variant.locked ? [index] : [],
        );
        const nextWeights = weightsFromDraggedHandle({
            previousWeights: weights,
            splitPositions: nextSplitPositions,
            draggedHandleIndex,
            lockedIndexes,
        });
        onWeightsChange(nextWeights);
    };

    return (
        <Bar hasError={weightsError}>
            <Segments>
                {variants.map((variant, index) => (
                    <Segment
                        key={variant.id}
                        style={{
                            flex: `${weights[index]} 0 0`,
                            background: variant.locked
                                ? lockedStripes(variant.color)
                                : variant.color,
                        }}
                    >
                        {weights[index] / 10}%
                    </Segment>
                ))}
            </Segments>
            {variants.length > 1 ? (
                <HandleSlider
                    onPointerDown={ignorePressesOutsideHandles} // only adjust weights by dragging handles
                    value={splitPositions}
                    min={0}
                    max={TOTAL_WEIGHT}
                    step={10}
                    track={false}
                    slots={{ thumb: GripThumb }}
                    slotProps={{
                        thumb: { hiddenHandleIndexes } as GripThumbProps,
                        rail: { style: { display: 'none' } },
                    }}
                    getAriaLabel={(index) =>
                        `Split between ${variants[index].name} and ${variants[index + 1].name}`
                    }
                    getAriaValueText={(splitPosition) =>
                        `${splitPosition / 10}%`
                    }
                    onChange={(_, value, activeHandleIndex) =>
                        changeSplitPositions(value, activeHandleIndex)
                    }
                    onChangeCommitted={() => {
                        draggedHandleIndexRef.current = null;
                    }}
                />
            ) : null}
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
        barVariantsAreEqual(previousProps.variants, nextProps.variants),
);
